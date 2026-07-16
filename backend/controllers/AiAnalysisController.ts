import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { Routine, Course, Teacher, Room, Batch } from '../models/Index';

export class AiAnalysisController {

  public static async analyze(req: Request, res: Response): Promise<void> {
    try {
      // 1. Check if Gemini API key exists
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(200).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured. Please add your Gemini API key under the AI Studio secrets configuration.'
        });
        return;
      }

      // 2. Fetch all system data to provide full schedule context to the AI
      const routines = await Routine.findAll({
        include: [
          { model: Course, as: 'course' },
          { model: Teacher, as: 'teacher' },
          { model: Room, as: 'room' },
          { model: Batch, as: 'batch' }
        ]
      });

      if (routines.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No routines found. Please generate a routine first before requesting AI analysis.'
        });
        return;
      }

      const teachers = await Teacher.findAll();
      const rooms = await Room.findAll();
      const batches = await Batch.findAll();
      const courses = await Course.findAll();

      // 3. Serialize data into high-density JSON text for the prompt
      const serializedSchedule = routines.map(r => ({
        day: r.day,
        slot: r.slot,
        courseCode: r.course?.courseCode,
        courseName: r.course?.courseName,
        courseType: r.course?.courseType,
        teacherName: r.teacher?.name,
        teacherId: r.teacherId,
        roomNumber: r.roomNumber,
        roomCapacity: r.room?.capacity,
        roomType: r.room?.type,
        batchName: `${r.batch?.batchNumber} Section ${r.batch?.section}`,
        studentCount: r.batch?.studentCount
      }));

      const contextSummary = {
        totalClassesScheduled: routines.length,
        totalTeachers: teachers.length,
        totalRooms: rooms.length,
        totalBatches: batches.length,
        totalCourses: courses.length,
        rooms: rooms.map(r => ({ roomNumber: r.getDataValue('roomNumber'), capacity: r.getDataValue('capacity'), type: r.getDataValue('type') })),
        teachers: teachers.map(t => ({ id: t.getDataValue('id'), name: t.getDataValue('name') })),
        batches: batches.map(b => ({ id: b.getDataValue('id'), name: `${b.getDataValue('batchNumber')} Section ${b.getDataValue('section')}`, count: b.getDataValue('studentCount') }))
      };

      // 4. Initialize `@google/genai`
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // 5. Query Gemini with structured output schemas
      const systemInstruction = `You are an expert academic scheduling analyst. You analyze class schedules for universities, identifying bottlenecks, resource utilization, and balance issues. Create a highly professional, clinical ERP schedule analysis. Keep your response practical, straightforward, and clean. Provide suggestions like "Room 302 is underutilized", "Teacher A has a heavy workload on Monday", or similar issues based on the actual schedule data provided.`;

      const prompt = `Analyze the following university schedule data. 
Context Summary:
${JSON.stringify(contextSummary, null, 2)}

Structured Routine:
${JSON.stringify(serializedSchedule, null, 2)}

Based on this data, provide:
1. Insights on Room utilization (look at capacity mismatches e.g. scheduling a small batch of 20 kids in a room of 100, or rooms never used).
2. Assessment of Teacher workloads (detect teachers scheduled for too many classes on a single day, or multiple blocks).
3. Student busy days and schedule balance (e.g. whether a batch section has classes spread out too much, or has 4 classes in a single day).
4. Scheduling inefficiencies (e.g. gaps in rooms, or unbalanced distribution of classes).`;

      const modelsToTry = ['gemini-2.5-flash','gemini-3.1-flash-lite', 'gemini-2.5-pro', 'gemini-3.5-flash'];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`AI Auditor: Attempting schedule analysis using model: ${modelName}`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  overallSummary: {
                    type: Type.STRING,
                    description: 'A 2-3 sentence overview of the health of the generated schedule.'
                  },
                  suggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Professional optimizations suggestions, such as underutilizations of rooms, heavy workloads for teachers, or spread-out section workloads.'
                  },
                  teacherWorkloadReview: {
                    type: Type.STRING,
                    description: 'A paragraph assessing how balanced the workloads across teachers are.'
                  },
                  roomUtilizationReview: {
                    type: Type.STRING,
                    description: 'A paragraph assessing room occupancy, types of rooms vs courses, and capacity matching.'
                  },
                  narrativeReportMarkdown: {
                    type: Type.STRING,
                    description: 'A comprehensive markdown-formatted academic audit of the scheduling inefficiencies and positives.'
                  }
                },
                required: ['overallSummary', 'suggestions', 'teacherWorkloadReview', 'roomUtilizationReview', 'narrativeReportMarkdown']
              }
            }
          });

          if (response && response.text) {
            console.log(`AI Auditor: Successfully analyzed schedule using model ${modelName}.`);
            break; // Break loop on successful extraction
          }
        } catch (error: any) {
          console.warn(`AI Auditor: Model ${modelName} failed or was unavailable:`, error.message || error);
          lastError = error;
        }
      }

      if (!response || !response.text) {
        throw new Error(`All Gemini candidate models returned empty responses or failed. Last error: ${lastError?.message || lastError}`);
      }

      const responseText = response.text;
      const parsedAnalysis = JSON.parse(responseText.trim());

      res.status(200).json({
        success: true,
        analysis: parsedAnalysis
      });

    } catch (err: any) {
      console.error('Gemini Analysis Error:', err);
      res.status(500).json({ 
        success: false, 
        error: `AI analysis failed: ${err.message || err}` 
      });
    }
  }
}
