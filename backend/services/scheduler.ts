import { Teacher, Room, Batch, Course, Routine } from "../models/Index";

export interface ScheduleItem {
  id: number;
  courseName: string;
  courseCode: string;
  courseType: "Theory" | "Lab";
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
  day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
  slot: number;
}

export interface ConflictReport {
  failedCourse: string;
  courseCode: string;
  reason: string;
}

const DAYS: Array<"Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday"> =
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

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
        { model: Teacher, as: "teacher" },
        { model: Batch, as: "batch" },
      ],
    });

    // Initialize tracking tables
    this.initializeBusyTrackers(teachersList, roomsList, batchesList);
       
    // 2. Prepare scheduling items
    // Theory needs 2 sessions (each 1 slot). Lab needs 1 session (requires 2 consecutive slots).
    const itemsToSchedule: ScheduleItem[] = [];
    for (const course of coursesList) {
      if (!course.getDataValue('teacherId')) {
        return {
          success: false,
          conflicts: [
            {
              failedCourse: course.getDataValue('courseName'),
              courseCode: course.getDataValue('courseCode'),
              reason: "Teacher not assigned to the course.",
            },
          ],
        };
      }

      // Fetch batch info safely
      const associatedBatch = await Batch.findByPk(course.getDataValue('batchId'));
      if (!associatedBatch) {
        return {
          success: false,
          conflicts: [
            {
              failedCourse: course.getDataValue('courseName'),
              courseCode: course.getDataValue('courseCode'),
              reason: "Associated class batch not found.",
            },
          ],
        };
      }

      const studentCount = associatedBatch.getDataValue('studentCount');

      // Pre-flight Check: Ensure at least one room fits the capacity and type requirement
      const suitableRooms = roomsList.filter(room => {
        if (course.getDataValue('courseType') === 'Lab' && room.getDataValue('type') !== 'Laboratory') {
          return false;
        }

        return room.getDataValue("capacity") >= studentCount;
      });

      if (suitableRooms.length === 0) {
        const errorReason =
          course.getDataValue('courseType') === "Lab"
            ? `No Laboratory room with capacity of ${studentCount} seats exists.`
            : `No Classroom with capacity of ${studentCount} seats exists.`;
        return {
          success: false,
          conflicts: [
            {
              failedCourse: course.getDataValue('courseName'),
              courseCode: course.getDataValue('courseCode'),
              reason: errorReason,
            },
          ],
        };
      }

      if (course.getDataValue('courseType') === "Theory") {
        itemsToSchedule.push({
          id: course.getDataValue('id') ?? 0,
          courseName: course.getDataValue('courseName') ?? 'Unknown',
          courseCode: course.getDataValue('courseCode') ?? 'N/A',
          courseType: "Theory",
          teacherId: course.getDataValue('teacherId') ?? '',
          batchId: course.getDataValue('batchId') ?? 0,
          studentCount,
          sessionIndex: 1,
        });
        itemsToSchedule.push({
          id: course.getDataValue('id') ?? 0,
          courseName: course.getDataValue('courseName') ?? 'Unknown',
          courseCode: course.getDataValue('courseCode') ?? 'N/A',
          courseType: "Theory",
          teacherId: course.getDataValue('teacherId') ?? '',
          batchId: course.getDataValue('batchId') ?? 0,
          studentCount,
          sessionIndex: 2,
        });
      } else {
        // Lab course = one lab session
        itemsToSchedule.push({
          id: course.getDataValue('id') ?? 0,
          courseName: course.getDataValue('courseName') ?? 'Unknown',
          courseCode: course.getDataValue('courseCode') ?? 'N/A',
          courseType: "Lab",
          teacherId: course.getDataValue('teacherId') ?? '',
          batchId: course.getDataValue('batchId') ?? 0,
          studentCount,
          sessionIndex: 1,
        });
      }
    }

    // Sort items to schedule: place Labs first.
    // Labs are harder to schedule (taking 2 slots and lab-rooms).
    itemsToSchedule.sort((a, b) => {
      if (a.courseType === "Lab" && b.courseType !== "Lab") return -1;
      if (a.courseType !== "Lab" && b.courseType === "Lab") return 1;
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

      // Find compatible rooms (capacity/type). Day availability will be applied per candidate day below.
      const baseCandidateRooms = roomsList.filter((room) => {
        // Lab courses MUST use Laboratory rooms only
        if (item.courseType === "Lab") {
          if (room.getDataValue("type") !== "Laboratory") {
            reasons.push(
              `Room ${room.getDataValue("roomNumber")} is a regular Classroom, cannot schedule Lab`,
            );
            return false;
          }
        }
        // Room capacity must be greater than or equal to student count
        if (room.getDataValue("capacity") < item.studentCount) {
          reasons.push(
            `Room ${room.getDataValue("roomNumber")} capacity (${room.getDataValue("capacity")}) < student count (${item.studentCount})`,
          );
          return false;
        }
        return true;
      }).sort((a, b) => {
        const capacityDiff = a.getDataValue("capacity") - b.getDataValue("capacity");
        if (capacityDiff !== 0) return capacityDiff;
        return String(a.getDataValue("roomNumber")).localeCompare(
          String(b.getDataValue("roomNumber")),
        );
      });

      if (baseCandidateRooms.length === 0) {
        conflictsMap[item.id] = conflictsMap[item.id] || [];
        conflictsMap[item.id].push(
          "No suitable room found (size or room type mismatch).",
        );
        return false;
      }

      // Backtracking choice exploration
      const candidateDays = [...DAYS].sort((a, b) => {
        const dayDiff = this.getDayLoad(a) - this.getDayLoad(b);
        if (dayDiff !== 0) return dayDiff;
        return DAYS.indexOf(a) - DAYS.indexOf(b);
      });

      for (const day of candidateDays) {
        // Filter rooms further by day availability
        const candidateRooms = baseCandidateRooms.filter((room) => {
          let availableDaysRaw: any = room.getDataValue('availableDays');
          let availableDays: string[] = ['Sunday','Monday','Tuesday','Wednesday','Thursday'];
          try {
            if (Array.isArray(availableDaysRaw)) {
              availableDays = availableDaysRaw;
            } else if (typeof availableDaysRaw === 'string') {
              const parsed = JSON.parse(availableDaysRaw);
              if (Array.isArray(parsed)) availableDays = parsed;
            }
          } catch (e) {
            availableDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday'];
          }
          return availableDays.includes(day);
        });

        if (candidateRooms.length === 0) {
          // No rooms available on this day, try next day
          continue;
        }
        // For Theory: Avoid scheduling same course on the same day or adjacent days
        const isTheory = item.courseType === "Theory";
        if (isTheory) {
          const daysScheduledBefore = Object.keys(
            this.scheduledDaysForCourse[item.id] || {},
          ).filter((d) => this.scheduledDaysForCourse[item.id][d]);
          if (daysScheduledBefore.includes(day)) {
            continue; // Skip same day
          }
          if (
            daysScheduledBefore.some((prevDay) =>
              this.isAdjacentDay(prevDay, day),
            )
          ) {
            continue; // Skip adjacent days
          }
        }

        // Loop slots
        const isLab = item.courseType === "Lab";
        const maxSlot = isLab ? 7 : 8; // Lab sessions need slot and slot + 1
        const slotLength = isLab ? 2 : 1;
        const candidateSlots = Array.from({ length: maxSlot }, (_, index) => index + 1).sort(
          (a, b) => {
            const blockDiff = this.getBlockLoad(day, a, slotLength) - this.getBlockLoad(day, b, slotLength);
            if (blockDiff !== 0) return blockDiff;
            return a - b;
          },
        );

        for (const slot of candidateSlots) {
          for (const room of candidateRooms) {
            const roomNumber = room.getDataValue("roomNumber");
            const isAvailable = isLab
              ? this.checkContiguousAvailability(item, roomNumber, day, slot, 2)
              : this.checkContiguousAvailability(item, roomNumber, day, slot, 1);

            if (isAvailable) {
              // 1. Reserve resource
              this.toggleReservation(
                item,
                roomNumber,
                day,
                slot,
                true,
              );

              // Record assigned slot
              if (!isLab) {
                finalRoutines.push({
                  courseId: item.id,
                  teacherId: item.teacherId,
                  roomNumber,
                  batchId: item.batchId,
                  day,
                  slot,
                });
              } else {
                // save BOTH slots for lab

                finalRoutines.push({
                  courseId: item.id,
                  teacherId: item.teacherId,
                  roomNumber,
                  batchId: item.batchId,
                  day,
                  slot,
                });

                finalRoutines.push({
                  courseId: item.id,
                  teacherId: item.teacherId,
                  roomNumber,
                  batchId: item.batchId,
                  day,
                  slot: slot + 1,
                });
              }

              // 2. Recurse next item
              if (solve(itemIdx + 1)) {
                return true;
              }

              // 3. Unreserve (backtrack)
              if (!isLab) {
                finalRoutines.pop();
              } else {
                finalRoutines.pop();
                finalRoutines.pop();
              }
              this.toggleReservation(
                item,
                roomNumber,
                day,
                slot,
                false,
              );
            } else {
              // Collect specific reasons for conflict reporting
              const isTeacherBusy = this.isTeacherBusyAt(
                item.teacherId,
                day,
                slot,
              );
              const isRoomBusy = this.isRoomBusyAt(
                roomNumber,
                day,
                slot,
              );
              const isBatchBusy = this.isBatchBusyAt(item.batchId, day, slot);

              if (isLab) {
                const isTeacherBusy2 = this.isTeacherBusyAt(
                  item.teacherId,
                  day,
                  slot + 1,
                );
                const isRoomBusy2 = this.isRoomBusyAt(
                  roomNumber,
                  day,
                  slot + 1,
                );
                const isBatchBusy2 = this.isBatchBusyAt(
                  item.batchId,
                  day,
                  slot + 1,
                );

                if (isTeacherBusy || isTeacherBusy2)
                  reasons.push(
                    `Teacher ${item.teacherId} unavailable in slot ${slot}-${slot + 1}`,
                  );
                if (isRoomBusy || isRoomBusy2)
                  reasons.push(
                    `Room ${roomNumber} unavailable in slot ${slot}-${slot + 1}`,
                  );
                if (isBatchBusy || isBatchBusy2)
                  reasons.push(
                    `Batch ${item.batchId} unavailable in slot ${slot}-${slot + 1}`,
                  );
              } else {
                if (isTeacherBusy)
                  reasons.push(
                    `Teacher ${item.teacherId} unavailable in slot ${slot}`,
                  );
                if (isRoomBusy)
                  reasons.push(
                    `Room ${roomNumber} unavailable in slot ${slot}`,
                  );
                if (isBatchBusy)
                  reasons.push(
                    `Batch ${item.batchId} unavailable in slot ${slot}`,
                  );
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
        routines: finalRoutines,
      };
    } else {
      // Find the courses which failed to schedule and build conflict records
      const conflicts: ConflictReport[] = [];
      const failedCourseIds = Object.keys(conflictsMap).map(Number);

      for (const cid of failedCourseIds) {
        const matchingCourse = coursesList.find((c) => c.getDataValue('id') === cid);
        if (matchingCourse) {
          const reasonsSample = conflictsMap[cid];
          let normalizedReason = "No available slot matching constraints.";

          if (
            reasonsSample.some(
              (r) => r.includes("Room") && r.includes("capacity"),
            )
          ) {
            normalizedReason =
              "No suitable room found (insufficient capacity).";
          } else if (
            reasonsSample.some(
              (r) => r.includes("Room") && r.includes("unavail"),
            )
          ) {
            normalizedReason = "No available slot due to room occupancy.";
          } else if (reasonsSample.some((r) => r.includes("Teacher"))) {
            normalizedReason = "Teacher unavailable during open slots.";
          } else if (
            reasonsSample.some((r) =>
              r.includes("Classroom, cannot schedule Lab"),
            )
          ) {
            normalizedReason = "No suitable laboratory room available.";
          }

          conflicts.push({
            failedCourse: matchingCourse.getDataValue('courseName'),
            courseCode: matchingCourse.getDataValue('courseCode'),
            reason: normalizedReason,
          });
        }
      }

      // Guaranteed to return at least one generic failure error if maps are empty
      if (conflicts.length === 0) {
        conflicts.push({
          failedCourse: "Full Term Generation",
          courseCode: "ALL",
          reason:
            "Backtracking logic resolved too many constraints simultaneously (Highly saturated schedule).",
        });
      }

      return {
        success: false,
        conflicts,
      };
    }
  }

  private initializeBusyTrackers(
    teachers: Teacher[],
    rooms: Room[],
    batches: Batch[],
  ): void {
    this.teacherBusy = {};
    this.roomBusy = {};
    this.batchBusy = {};
    this.scheduledDaysForCourse = {};

    for (const t of teachers) {
      this.teacherBusy[t.getDataValue('id')] = {};
      for (const d of DAYS) {
        this.teacherBusy[t.getDataValue('id')][d] = new Array(9).fill(false); // index 0-8 (using 1-8)
      }
    }

    for (const r of rooms) {
      const roomNum = r.getDataValue("roomNumber");
      // availableDays may be stored as JSON array or stringified JSON; normalize to array
      let availableDaysRaw: any = r.getDataValue('availableDays');
      let availableDays: string[] = ['Sunday','Monday','Tuesday','Wednesday','Thursday'];
      try {
        if (Array.isArray(availableDaysRaw)) {
          availableDays = availableDaysRaw;
        } else if (typeof availableDaysRaw === 'string') {
          const parsed = JSON.parse(availableDaysRaw);
          if (Array.isArray(parsed)) availableDays = parsed;
        }
      } catch (e) {
        // fallback to default
        availableDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday'];
      }

      this.roomBusy[roomNum] = {};
      for (const d of DAYS) {
        // If the room is not available on a given day, mark all slots busy (unavailable)
        this.roomBusy[roomNum][d] = availableDays.includes(d) ? new Array(9).fill(false) : new Array(9).fill(true);
      }
    }

    for (const b of batches) {
      this.batchBusy[b.getDataValue('id')] = {};
      for (const d of DAYS) {
        this.batchBusy[b.getDataValue('id')][d] = new Array(9).fill(false);
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

  private getDayLoad(day: string): number {
    let load = 0;

    for (const roomNumber of Object.keys(this.roomBusy)) {
      const slots = this.roomBusy[roomNumber]?.[day];
      if (!slots) continue;

      for (let slot = 1; slot <= 8; slot++) {
        if (slots[slot]) load++;
      }
    }

    return load;
  }

  private getBlockLoad(day: string, startSlot: number, length: number): number {
    let load = 0;
    const endSlot = Math.min(8, startSlot + length - 1);

    for (let slot = startSlot; slot <= endSlot; slot++) {
      for (const roomNumber of Object.keys(this.roomBusy)) {
        if (this.roomBusy[roomNumber]?.[day]?.[slot]) {
          load++;
        }
      }
    }

    return load;
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
   * Safe constraint verification for a contiguous block of slots.
   * length = 1 for theory, 2 for lab.
   */
  private checkContiguousAvailability(
    item: ScheduleItem,
    roomNumber: string,
    day: string,
    startSlot: number,
    length: number,
  ): boolean {
    const endSlot = startSlot + length - 1;
    if (endSlot > 8) return false;

    for (let slot = startSlot; slot <= endSlot; slot++) {
      if (this.isRoomBusyAt(roomNumber, day, slot)) return false;
      if (this.isTeacherBusyAt(item.teacherId, day, slot)) return false;
      if (this.isBatchBusyAt(item.batchId, day, slot)) return false;
    }

    return true;
  }

  /**
   * Reserving/Freeing logic helper
   */
  private toggleReservation(
    item: ScheduleItem,
    roomNumber: string,
    day: string,
    slot: number,
    reserve: boolean,
  ) {
    const slots = item.courseType === "Theory" ? [slot] : [slot, slot + 1];

    for (const s of slots) {
      if (
        this.teacherBusy[item.teacherId] &&
        this.teacherBusy[item.teacherId][day]
      ) {
        this.teacherBusy[item.teacherId][day][s] = reserve;
      }
      if (this.roomBusy[roomNumber] && this.roomBusy[roomNumber][day]) {
        this.roomBusy[roomNumber][day][s] = reserve;
      }
      if (this.batchBusy[item.batchId] && this.batchBusy[item.batchId][day]) {
        this.batchBusy[item.batchId][day][s] = reserve;
      }
    }

    if (item.courseType === "Theory") {
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
    const routinesToCreate = slots.map((s) => ({
      courseId: s.courseId,
      teacherId: s.teacherId,
      roomNumber: s.roomNumber,
      batchId: s.batchId,
      day: s.day,
      slot: s.slot,
    }));

    await Routine.bulkCreate(routinesToCreate);
  }
}
