import { Teacher, Room, Batch, Course, Routine } from '../models/Index';

export interface ScheduleItem {
  id: number;
  courseName: string;
  courseCode: string;
  courseType: 'Theory' | 'Lab';
  teacherId: string;
  batchId: number;
  studentCount: number;
  sessionIndex: number;
}

export interface ScheduledSlot {
  courseId: number;
  teacherId: string;
  roomNumber: string;
  batchId: number;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  slot: number;
}

export interface ConflictReport {
  failedCourse: string;
  courseCode: string;
  reason: string;
}

const DAYS: Array<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday'
];

export class RoutineScheduler {
  // Analytical trackers to speed up conflict-free checks
  private teacherBusy: Record<string, Record<string, boolean[]>> = {};
  private roomBusy: Record<string, Record<string, boolean[]>> = {};
  private batchBusy: Record<number, Record<string, boolean[]>> = {};
  
  // To avoid scheduling two sessions of the same Theory course on the same day
  private scheduledDaysForCourse: Record<number, Record<string, boolean>> = {};

  constructor() {}

  /**
   * Main entry point to generate the routine automatically.
   */
  public async generateRoutine(): Promise<{
    success: boolean;
    routines?: ScheduledSlot[];
    conflicts?: ConflictReport[];
  }> {
    // 1. Load data from the databases
    const teachersList = await Teacher.findAll();
    const roomsList = await Room.findAll();
    const batchesList = await Batch.findAll();
    const coursesList = await Course.findAll({
      include: [
        { model: Teacher, as: 'teacher' },
        { model: Batch, as: 'batch' }
      ]
    });

    // Initialize tracking tables
    this.initializeBusyTrackers(teachersList, roomsList, batchesList);

    // 2. Prepare scheduling items
    // Theory needs 2 sessions (each 1 slot). Lab needs 1 session (requires 2 consecutive slots).
    const itemsToSchedule: ScheduleItem[] = [];
    for (const course of coursesList) {
      if (!course.teacherId) {
        return {
          success: false,
          conflicts: [
            {
              failedCourse: course.courseName,
              courseCode: course.courseCode,
              reason: 'Teacher not assigned to the course.'
            }
          ]
        };
      }

      // Fetch batch info safely
      const associatedBatch = await Batch.findByPk(course.batchId);
      if (!associatedBatch) {
        return {
          success: false,
          conflicts: [
            {
              failedCourse: course.courseName,
              courseCode: course.courseCode,
              reason: 'Associated class batch not found.'
            }
          ]
        };
      }

      const studentCount = associatedBatch.studentCount;

      // Pre-flight Check: Ensure at least one room fits the capacity and type requirement
      const suitableRooms = roomsList.filter(room => {
        if (course.courseType === 'Lab' && room.type !== 'Laboratory') {
          return false;
        }
        return room.capacity >= studentCount;
      });

      if (suitableRooms.length === 0) {
        const errorReason = course.courseType === 'Lab'
          ? `No Laboratory room with capacity of ${studentCount} seats exists.`
          : `No Classroom with capacity of ${studentCount} seats exists.`;
        return {
          success: false,
          conflicts: [
            {
              failedCourse: course.courseName,
              courseCode: course.courseCode,
              reason: errorReason
            }
          ]
        };
      }

      if (course.courseType === 'Theory') {
        itemsToSchedule.push({
          id: course.id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          courseType: 'Theory',
          teacherId: course.teacherId,
          batchId: course.batchId,
          studentCount,
          sessionIndex: 1
        });
        itemsToSchedule.push({
          id: course.id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          courseType: 'Theory',
          teacherId: course.teacherId,
          batchId: course.batchId,
          studentCount,
          sessionIndex: 2
        });
      } else {
        itemsToSchedule.push({
          id: course.id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          courseType: 'Lab',
          teacherId: course.teacherId,
          batchId: course.batchId,
          studentCount,
          sessionIndex: 1
        });
      }
    }

    // Sort items to schedule: place Labs first.
    // Labs are harder to schedule (taking 2 slots and lab-rooms).
    itemsToSchedule.sort((a, b) => {
      if (a.courseType === 'Lab' && b.courseType !== 'Lab') return -1;
      if (a.courseType !== 'Lab' && b.courseType === 'Lab') return 1;
      return b.studentCount - a.studentCount; // Schedule larger cohorts earlier
    });

    const finalRoutines: ScheduledSlot[] = [];
    let steps = 0;
    const maxSteps = 150000;
    const conflictsMap: Record<number, string[]> = {};

    const solve = (itemIdx: number): boolean => {
      steps++;
      if (steps > maxSteps) {
        return false; // Backtracking limit reached
      }

      if (itemIdx === itemsToSchedule.length) {
        return true; // Successfully scheduled everything
      }

      const item = itemsToSchedule[itemIdx];
      const reasons: string[] = [];

      // Find compatible rooms
      const candidateRooms = roomsList.filter(room => {
        // Lab courses MUST use Laboratory rooms only
        if (item.courseType === 'Lab') {
          if (room.type !== 'Laboratory') {
            reasons.push(`Room ${room.roomNumber} is a regular Classroom, cannot schedule Lab`);
            return false;
          }
        }
        // Room capacity must be greater than or equal to student count
        if (room.capacity < item.studentCount) {
          reasons.push(`Room ${room.roomNumber} capacity (${room.capacity}) < student count (${item.studentCount})`);
          return false;
        }
        return true;
      });

      if (candidateRooms.length === 0) {
        conflictsMap[item.id] = conflictsMap[item.id] || [];
        conflictsMap[item.id].push('No suitable room found (size or room type mismatch).');
        return false;
      }

      // Backtracking choice exploration
      for (const day of DAYS) {
        // For Theory: Avoid scheduling same course on the same day or adjacent days
        const isTheory = item.courseType === 'Theory';
        if (isTheory) {
          const daysScheduledBefore = Object.keys(this.scheduledDaysForCourse[item.id] || {}).filter(
            d => this.scheduledDaysForCourse[item.id][d]
          );
          if (daysScheduledBefore.includes(day)) {
            continue; // Skip same day
          }
          if (daysScheduledBefore.some(prevDay => this.isAdjacentDay(prevDay, day))) {
            continue; // Skip adjacent days
          }
        }

        // Loop slots
        const maxSlot = item.courseType === 'Lab' ? 7 : 8; // Labs need 2 consecutive slots, so start slot <= 7

        for (let slot = 1; slot <= maxSlot; slot++) {
          for (const room of candidateRooms) {
            const isAvailable = this.checkAvailability(item, room.roomNumber, day, slot);
            
            if (isAvailable) {
              // 1. Reserve resource
              this.toggleReservation(item, room.roomNumber, day, slot, true);
              
              // Record assigned slot
              const scheduled: ScheduledSlot = {
                courseId: item.id,
                teacherId: item.teacherId,
                roomNumber: room.roomNumber,
                batchId: item.batchId,
                day,
                slot
              };
              finalRoutines.push(scheduled);

              // 2. Recurse next item
              if (solve(itemIdx + 1)) {
                return true;
              }

              // 3. Unreserve (backtrack)
              finalRoutines.pop();
              this.toggleReservation(item, room.roomNumber, day, slot, false);
            } else {
              // Collect specific reasons for conflict reporting
              const isTeacherBusy = this.isTeacherBusyAt(item.teacherId, day, slot);
              const isRoomBusy = this.isRoomBusyAt(room.roomNumber, day, slot);
              const isBatchBusy = this.isBatchBusyAt(item.batchId, day, slot);

              if (item.courseType === 'Lab') {
                const isTeacherBusy2 = this.isTeacherBusyAt(item.teacherId, day, slot + 1);
                const isRoomBusy2 = this.isRoomBusyAt(room.roomNumber, day, slot + 1);
                const isBatchBusy2 = this.isBatchBusyAt(item.batchId, day, slot + 1);
                
                if (isTeacherBusy || isTeacherBusy2) reasons.push(`Teacher ${item.teacherId} unavailable in slot ${slot}-${slot+1}`);
                if (isRoomBusy || isRoomBusy2) reasons.push(`Room ${room.roomNumber} unavailable in slot ${slot}-${slot+1}`);
                if (isBatchBusy || isBatchBusy2) reasons.push(`Batch ${item.batchId} unavailable in slot ${slot}-${slot+1}`);
              } else {
                if (isTeacherBusy) reasons.push(`Teacher ${item.teacherId} unavailable in slot ${slot}`);
                if (isRoomBusy) reasons.push(`Room ${room.roomNumber} unavailable in slot ${slot}`);
                if (isBatchBusy) reasons.push(`Batch ${item.batchId} unavailable in slot ${slot}`);
              }
            }
          }
        }
      }

      // If we reach here, we failed to program of this item in any slot/room combinations
      conflictsMap[item.id] = Array.from(new Set(reasons)).slice(0, 3);
      return false;
    };

    const isSolved = solve(0);

    if (isSolved) {
      return {
        success: true,
        routines: finalRoutines
      };
    } else {
      // Find the courses which failed to schedule and build conflict records
      const conflicts: ConflictReport[] = [];
      const failedCourseIds = Object.keys(conflictsMap).map(Number);
      
      for (const cid of failedCourseIds) {
        const matchingCourse = coursesList.find(c => c.id === cid);
        if (matchingCourse) {
          const reasonsSample = conflictsMap[cid];
          let normalizedReason = 'No available slot matching constraints.';
          
          if (reasonsSample.some(r => r.includes('Room') && r.includes('capacity'))) {
            normalizedReason = 'No suitable room found (insufficient capacity).';
          } else if (reasonsSample.some(r => r.includes('Room') && r.includes('unavail'))) {
            normalizedReason = 'No available slot due to room occupancy.';
          } else if (reasonsSample.some(r => r.includes('Teacher'))) {
            normalizedReason = 'Teacher unavailable during open slots.';
          } else if (reasonsSample.some(r => r.includes('Classroom, cannot schedule Lab'))) {
            normalizedReason = 'No suitable laboratory room available.';
          }

          conflicts.push({
            failedCourse: matchingCourse.courseName,
            courseCode: matchingCourse.courseCode,
            reason: normalizedReason
          });
        }
      }

      // Guaranteed to return at least one generic failure error if maps are empty
      if (conflicts.length === 0) {
        conflicts.push({
          failedCourse: 'Full Term Generation',
          courseCode: 'ALL',
          reason: 'Backtracking logic resolved too many constraints simultaneously (Highly saturated schedule).'
        });
      }

      return {
        success: false,
        conflicts
      };
    }
  }

  private initializeBusyTrackers(teachers: Teacher[], rooms: Room[], batches: Batch[]): void {
    this.teacherBusy = {};
    this.roomBusy = {};
    this.batchBusy = {};
    this.scheduledDaysForCourse = {};

    for (const t of teachers) {
      this.teacherBusy[t.id] = {};
      for (const d of DAYS) {
        this.teacherBusy[t.id][d] = new Array(9).fill(false); // index 0-8 (using 1-8)
      }
    }

    for (const r of rooms) {
      this.roomBusy[r.roomNumber] = {};
      for (const d of DAYS) {
        this.roomBusy[r.roomNumber][d] = new Array(9).fill(false);
      }
    }

    for (const b of batches) {
      this.batchBusy[b.id] = {};
      for (const d of DAYS) {
        this.batchBusy[b.id][d] = new Array(9).fill(false);
      }
    }
  }

  private isTeacherBusyAt(tid: string, day: string, slot: number): boolean {
    return this.teacherBusy[tid]?.[day]?.[slot] || false;
  }

  private isRoomBusyAt(roomNum: string, day: string, slot: number): boolean {
    return this.roomBusy[roomNum]?.[day]?.[slot] || false;
  }

  private isBatchBusyAt(bid: number, day: string, slot: number): boolean {
    return this.batchBusy[bid]?.[day]?.[slot] || false;
  }

  /**
   * Helper to check if two days are adjacent in the academic schedule
   */
  private isAdjacentDay(day1: string, day2: string): boolean {
    const idx1 = DAYS.indexOf(day1 as any);
    const idx2 = DAYS.indexOf(day2 as any);
    if (idx1 === -1 || idx2 === -1) return false;
    return Math.abs(idx1 - idx2) === 1;
  }

  /**
   * Safe constraint verification
   */
  private checkAvailability(item: ScheduleItem, roomNumber: string, day: string, slot: number): boolean {
    if (item.courseType === 'Theory') {
      // Single slot reservation check
      if (this.isRoomBusyAt(roomNumber, day, slot)) return false;
      if (this.isTeacherBusyAt(item.teacherId, day, slot)) return false;
      if (this.isBatchBusyAt(item.batchId, day, slot)) return false;
      return true;
    } else {
      // Lab needs slot AND slot+1 reservation checks
      const s1 = slot;
      const s2 = slot + 1;
      if (s2 > 8) return false;

      if (this.isRoomBusyAt(roomNumber, day, s1) || this.isRoomBusyAt(roomNumber, day, s2)) return false;
      if (this.isTeacherBusyAt(item.teacherId, day, s1) || this.isTeacherBusyAt(item.teacherId, day, s2)) return false;
      if (this.isBatchBusyAt(item.batchId, day, s1) || this.isBatchBusyAt(item.batchId, day, s2)) return false;
      return true;
    }
  }

  /**
   * Reserving/Freeing logic helper
   */
  private toggleReservation(item: ScheduleItem, roomNumber: string, day: string, slot: number, reserve: boolean) {
    const slots = item.courseType === 'Theory' ? [slot] : [slot, slot + 1];

    for (const s of slots) {
      if (this.teacherBusy[item.teacherId] && this.teacherBusy[item.teacherId][day]) {
        this.teacherBusy[item.teacherId][day][s] = reserve;
      }
      if (this.roomBusy[roomNumber] && this.roomBusy[roomNumber][day]) {
        this.roomBusy[roomNumber][day][s] = reserve;
      }
      if (this.batchBusy[item.batchId] && this.batchBusy[item.batchId][day]) {
        this.batchBusy[item.batchId][day][s] = reserve;
      }
    }

    if (item.courseType === 'Theory') {
      if (!this.scheduledDaysForCourse[item.id]) {
        this.scheduledDaysForCourse[item.id] = {};
      }
      this.scheduledDaysForCourse[item.id][day] = reserve;
    }
  }

  /**
   * Performs real persist of successfully generated schedule into Routine table.
   * Clears old routine first.
   */
  public async saveGeneratedRoutine(slots: ScheduledSlot[]): Promise<void> {
    // Clear existing
    await Routine.destroy({ truncate: true });

    // Bulk create
    const routinesToCreate = slots.map(s => ({
      courseId: s.courseId,
      teacherId: s.teacherId,
      roomNumber: s.roomNumber,
      batchId: s.batchId,
      day: s.day,
      slot: s.slot
    }));

    await Routine.bulkCreate(routinesToCreate);
  }
}
