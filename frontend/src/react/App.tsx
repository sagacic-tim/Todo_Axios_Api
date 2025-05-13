import React, { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
}

const CalendarGrid = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [month, setMonth] = useState(5); // May
  const [year, setYear] = useState(2025);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "" });

  useEffect(() => {
    axios
      .get("http://localhost:8080/tasks")
      .then((response) => setTasks(response.data))
      .catch((error) => console.error(error));
  }, []);

  const handleMonthChange = (increment: number) => {
    let newMonth = month + increment;
    if (newMonth < 1) {
      newMonth = 12;
      setYear(year - 1);
    } else if (newMonth > 12) {
      newMonth = 1;
      setYear(year + 1);
    }
    setMonth(newMonth);
  };

  const generateCalendar = () => {
    const days: JSX.Element[] = [];
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <div key={i} className="calendar-day" onClick={() => setSelectedDay(i)}>
          <p>{i}</p>
          {renderTasksForDay(i)}
        </div>
      );
    }

    const remainingCells = 35 - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-${i + days.length}`} className="calendar-day empty"></div>);
    }

    return days;
  };

  const renderTasksForDay = (day: number) => {
    return tasks
      .filter((task) => new Date(task.due_date).getDate() === day)
      .map((task) => (
        <div key={task.id} className="task">
          <p>{task.title}</p>
          <p>{task.completed ? "Completed" : "Pending"}</p>
        </div>
      ));
  };

  const handleSubmit = () => {
    const newTask = {
      title: taskForm.title,
      description: taskForm.description,
      due_date: `${year}-${month}-${selectedDay}`,
      completed: false,
    };

    axios
      .post("http://localhost:8080/tasks", newTask)
      .then(() => {
        setTaskForm({ title: "", description: "" });
        axios
          .get("http://localhost:8080/tasks")
          .then((response) => setTasks(response.data))
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h1>
        Calendar for {month}/{year}
        <button onClick={() => handleMonthChange(-1)}>&lt;</button>
        <button onClick={() => handleMonthChange(1)}>&gt;</button>
      </h1>
      <div className="calendar-grid">{generateCalendar()}</div>

      {selectedDay && (
        <div className="task-form">
          <h3>Task for {selectedDay}/{month}/{year}</h3>
          <input
            type="text"
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <textarea
            placeholder="Task description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <button onClick={handleSubmit}>Save Task</button>
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
