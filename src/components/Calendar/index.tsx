/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useRef, useState } from "react";
import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import type { EventInput } from "@fullcalendar/core/index.js";

import "../profileCalendar.scss";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import Modal from "../Modal";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

const classes = [
  "bg-one",
  "bg-two",
  "bg-three",
  "bg-four",
  "bg-five",
  "bg-six",
  "bg-seven",
  "bg-eight",
  "bg-nine",
  "bg-ten",
  "bg-eleven",
  "bg-twelve",
  "bg-thirteen",
  "bg-fourteen",
  "bg-fifteen",
  "bg-sixteen",
  "bg-seventeen",
  "bg-eighteen",
  "bg-nineteen",
  "bg-twenty",
  "bg-twenty-one",
  "bg-twenty-two",
  "bg-twenty-three",
  "bg-twenty-four",
  "bg-twenty-five",
  "bg-twenty-six",
  "bg-twenty-seven",
  "bg-twenty-eight",
  "bg-twenty-nine",
  "bg-thirty",
  "bg-thirty-one",
  "bg-thirty-two",
  "bg-thirty-three",
  "bg-thirty-four",
  "bg-thirty-five",
  "bg-thirty-six",
  "bg-thirty-seven",
  "bg-thirty-eight",
  "bg-thirty-nine",
  "bg-forty",
];

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [highlightedPairDates, setHighlightedPairDates] = useState<string[]>(
    []
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [selectedEventInfo, setSelectedEventInfo] =
    useState<EventInput | null>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPlugins = () => {
    const plugins = [dayGridPlugin];

    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssigmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff) => id === staff.id);
  };

  const getSelectedStaff = () => {
    return schedule?.staffs?.find((staff) => staff.id === selectedStaffId);
  };

  const validDates = () => {
    const dates = [];
    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates = [];
    const start = dayjs(startDate, "DD.MM.YYYY").toDate();
    const end = dayjs(endDate, "DD.MM.YYYY").toDate();
    const current = new Date(start);

    while (current <= end) {
      dates.push(dayjs(current).format("DD-MM-YYYY"));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateStaffBasedCalendar = () => {
    const works: EventInput[] = [];

    const staffBasedAssignments = schedule?.assignments?.filter(
      (assignment) => assignment.staffId === selectedStaffId
    );

    for (let i = 0; i < staffBasedAssignments?.length; i++) {
      const className = schedule?.shifts?.findIndex(
        (shift) => shift.id === staffBasedAssignments?.[i]?.shiftId
      );

      const assignmentDate = dayjs
        .utc(staffBasedAssignments?.[i]?.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);

      const work = {
        id: staffBasedAssignments?.[i]?.id,
        title: getShiftById(staffBasedAssignments?.[i]?.shiftId)?.name,
        // duration: "01:00",
        shiftStart: staffBasedAssignments?.[i]?.shiftStart,
        shiftEnd: staffBasedAssignments?.[i]?.shiftEnd,
        date: assignmentDate,
        staffId: staffBasedAssignments?.[i]?.staffId,
        shiftId: staffBasedAssignments?.[i]?.shiftId,
        className: `event ${classes[className]} ${
          getAssigmentById(staffBasedAssignments?.[i]?.id)?.isUpdated
            ? "highlight"
            : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );
    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) highlightedDates.push(date);
    });

    let highlightedPairDates: string[] = [];
    const pairList = getSelectedStaff()?.pairList || [];

    pairList.forEach((pair) => {
      const pairDates = getDatesBetween(
        dayjs(pair.startDate, "DD.MM.YYYY").format("DD.MM.YYYY"),
        dayjs(pair.endDate, "DD.MM.YYYY").format("DD.MM.YYYY")
      );
      highlightedPairDates.push(...pairDates);
    });

    setHighlightedDates(highlightedDates);
    setHighlightedPairDates(highlightedPairDates);
    setEvents(works);
  };

  useEffect(() => {
    if (schedule?.scheduleStartDate) {
      setInitialDate(dayjs(schedule.scheduleStartDate).toDate());
    }
    setSelectedStaffId(schedule?.staffs?.[0]?.id);
    generateStaffBasedCalendar();
  }, [schedule]);

  useEffect(() => {
    generateStaffBasedCalendar();
  }, [selectedStaffId]);

  const RenderEventContent = ({ eventInfo }: any) => {
    return (
      <div className="event-content">
        <p>{eventInfo.event.title}</p>
      </div>
    );
  };

  return (
    <>
      <div className="calendar-section">
        <div className="calendar-wrapper">
          <div className="staff-list">
            {schedule?.staffs?.map((staff: any) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id)}
                className={`staff ${
                  staff.id === selectedStaffId ? "active" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                >
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T480-440q67 0 131.5 16T736-378q30 15 47 43.5t17 62.5v112H160Zm320-400q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm160 228v92h80v-32q0-11-5-20t-15-14q-14-8-29.5-14.5T640-332Zm-240-21v53h160v-53q-20-4-40-5.5t-40-1.5q-20 0-40 1.5t-40 5.5ZM240-240h80v-92q-15 5-30.5 11.5T260-306q-10 5-15 14t-5 20v32Zm400 0H320h320ZM480-640Z" />
                </svg>
                <span>{staff.name}</span>
              </div>
            ))}
          </div>
          {initialDate && (
            <div className="staff-calendar-container">
              <FullCalendar
                ref={calendarRef}
                locale={auth.language}
                plugins={getPlugins()}
                contentHeight={400}
                handleWindowResize={true}
                selectable={true}
                editable={false}
                eventStartEditable={false}
                eventOverlap={true}
                eventDurationEditable={false}
                initialView="dayGridMonth"
                initialDate={initialDate}
                events={events}
                firstDay={1}
                dayMaxEventRows={4}
                fixedWeekCount={true}
                showNonCurrentDates={true}
                eventContent={(eventInfo: any) => (
                  <RenderEventContent eventInfo={eventInfo} />
                )}
                eventClick={(eventInfo: any) => {
                  setSelectedEventInfo(
                    events.find((event) => event.id === eventInfo.event.id)
                  );
                  setIsModalOpen(true);
                }}
                eventDidMount={(info: any) => {
                  info.el.style.cursor = "pointer";
                }}
                dayCellContent={({ date }) => {
                  const found = validDates().includes(
                    dayjs(date).format("YYYY-MM-DD")
                  );
                  const isHighlighted = highlightedDates.includes(
                    dayjs(date).format("DD-MM-YYYY")
                  );
                  const isHighlightedPair = highlightedPairDates.includes(
                    dayjs(date).format("DD-MM-YYYY")
                  );

                  return (
                    <div
                      className={`${found ? "" : "date-range-disabled"} ${
                        isHighlighted ? "highlighted-date-orange" : ""
                      } ${isHighlightedPair ? "highlightedPair" : ""}`}
                    >
                      {dayjs(date).date()}
                    </div>
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="shift-modal">
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customTitle={
            <div className="modal-custom-title">
              <span className="modal-title">{selectedEventInfo?.title}</span>
              <span className="modal-subtitle">
                {dayjs(selectedEventInfo?.date?.toString()).format(
                  "DD.MM.YYYY"
                )}
              </span>
            </div>
          }
        >
          <div className="modal-body">
            <div className="modal-item">
              <label>Staff:</label>
              <input
                type="text"
                value={getStaffById(selectedEventInfo?.staffId)?.name}
                readOnly
                className="modal-input"
              />
            </div>
            <div className="modal-item">
              <label>Shift Start:</label>
              <input
                type="text"
                value={dayjs.utc(selectedEventInfo?.shiftStart).format("HH:mm")}
                readOnly
                className="modal-input"
              />
            </div>
            <div className="modal-item">
              <label>Shift End:</label>
              <input
                type="text"
                value={dayjs.utc(selectedEventInfo?.shiftEnd).format("HH:mm")}
                readOnly
                className="modal-input"
              />
            </div>
            <div className="modal-item">
              <label>Duration:</label>
              <input
                type="text"
                value={dayjs(selectedEventInfo?.shiftEnd)
                  .diff(dayjs(selectedEventInfo?.shiftStart), "hour")
                  .toString()}
                readOnly
                className="modal-input"
              />
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default CalendarContainer;
