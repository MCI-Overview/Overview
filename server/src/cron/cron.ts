// src/cron.ts
const cron = require('node-cron');
import { prisma } from "../../src/client";
import dayjs = require("dayjs");

async function updateAttendanceStatus() {
  try {
    const now = dayjs();

    console.log(dayjs())

    const attendances = await prisma.attendance.findMany({
      where: {
        status: null,
        OR: [
          {
            shiftDate: {
              lt: now.toDate()
            }
          }, {
            shiftDate: {
              lte: now.toDate()
            },
            Shift: {
              startTime: {
                lte: now.set('date', 1).set('month', 0).set('year', 2000).toDate()
              },
            }
          }
        ]
      },
      include: {
        Shift: true,
      },
    });
    const updatePromises = attendances.map((attendance) =>
      prisma.attendance.update({
        where: { cuid: attendance.cuid },
        data: { status: 'NO_SHOW' },
      })
    );

    await Promise.all(updatePromises);
    console.log('Attendance statuses updated to NO_SHOW');
  } catch (error) {
    console.error('Error updating attendance statuses:', error);
  }
}

// Schedule the updateAttendanceStatus function to run every 15 minutes
cron.schedule('*/1 * * * *', () => {
  console.log('Running the scheduled task to update attendance statuses');
  updateAttendanceStatus();
});

console.log('Cron job scheduled.');