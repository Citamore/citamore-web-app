import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { addMonths, endOfMonth, startOfMonth, eachDayOfInterval, isToday, isSameDay, format } from 'date-fns';
 
@Component({
  selector: 'app-custom-calendar',
  templateUrl: './custom-calendar.component.html',
  styleUrl: './custom-calendar.component.scss',
  standalone:false
})
export class CustomCalendarComponent {
  today = new Date();
  currentMonth = new Date();
  selectedDay = new Date();
  weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  daysInMonth: Date[] = [];
  
  @Output() selectedDate = new EventEmitter<Date>();

  ngOnInit() {
    this.updateCalendar();
  }

  updateCalendar() {
    this.daysInMonth = eachDayOfInterval({
      start: startOfMonth(this.currentMonth),
      end: endOfMonth(this.currentMonth),
    });
  }

  previousMonth() {
    this.currentMonth = addMonths(this.currentMonth, -1);
    this.updateCalendar();
  }

  nextMonth() {
    this.currentMonth = addMonths(this.currentMonth, 1);
    this.updateCalendar();
  }

  selectDay(day: Date) {
    this.selectedDay = day;
  }

  isToday(day: Date): boolean {
    return isToday(day);
  }

  isSelectedDay(day: Date): boolean {
    return isSameDay(day, this.selectedDay);
  }

  confirmSelection() {
    this.selectedDate.emit(this.selectedDay);
  }
}
