import React, { Component } from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { getRangeOfDates } from '../../helpers/index';
import { BookingModal } from './BookingModal';

import * as moment from 'moment';

export class Booking extends Component {
  constructor() {
    super();

    this.bookedOutDates = [];
    this.dateRef = React.createRef();
    this.state = {
      proposedBooking: {
        startAt: '',
        endAt: '',
        guests: 0,
        rental: {}
      },
      modal: {
        open: false
      }
    }
  }

  componentDidMount() {
    this.getBookedOutDates();
  }

  getBookedOutDates() {
    const { bookings } = this.props.rental;

    if (bookings && bookings.length > 0) {
      bookings.forEach(booking => {
        const dateRange = getRangeOfDates(
          booking.startAt,
          booking.endAt,
          'Y/MM/DD'
        );
        this.bookedOutDates.push(...dateRange);
      });
    }
  }

  // Disable dates from picker if dates already booked || < today
  // isInvalidDate fn loops through all the days within dropdown picker window
  // we can then compare those dates with our own dates
  checkInvalidDates = date => { // date --> moment object (we can call it anything we want)
    return this.bookedOutDates.includes(date.format('Y/MM/DD')) || date.diff(moment(), 'days') < 0;
  };

  handleApply = (e, picker) => {
    const startAt = picker.startDate.format('Y/MM/DD');
    const endAt = picker.endDate.format('Y/MM/DD');

    this.dateRef.current.value = startAt + ' - ' + endAt;

    this.setState({
      proposedBooking: {
        ...this.state.proposedBooking,
        startAt,
        endAt
      }
    });
  }

  selectGuests = (e) => {
    this.setState({
      proposedBooking: {
        ...this.state.proposedBooking,
        guests: parseInt(e.target.value)
      }
    })
  }

  cancelConfirmation = () => {
    this.setState({
      modal: {
        open: false
      }
    })
  }

  confirmProposedData = () => {
    const {startAt, endAt} = this.state.proposedBooking;
    const days = getRangeOfDates(startAt, endAt).length - 1;
    const { rental } = this.props;

    this.setState({
      proposedBooking: {
        ...this.state.proposedBooking,
        days,
        totalPrice: days * rental.dailyRate,
        rental
      },
      modal: {
        open: true
      }
    })
    console.log(this.state);
  }

  render() {
    const { rental } = this.props;
    const { startAt, endAt, guests } = this.state.proposedBooking;

    return (
      <div className="booking">
        <h3 className="booking-price">
          $ {rental.dailyRate}{' '}
          <span className="booking-per-night">per night</span>
        </h3>
        <hr />
        <div className="form-group">
          <label htmlFor="dates">Dates</label>
          <DateRangePicker
            isInvalidDate={this.checkInvalidDates}
            onApply={this.handleApply}
            opens="left"
            containerStyles={{ display: 'block' }}
            // minDate={moment()} // --> block out past dates
          >
            <input ref={this.dateRef} id="dates" type="text" className="form-control" />
          </DateRangePicker>
        </div>
        <div className="form-group">
          <label htmlFor="guests">Guests</label>
          <input
            onChange={this.selectGuests}
            type="number"
            className="form-control"
            id="guests"
            aria-describedby="emailHelp"
            placeholder=""
          />
        </div>
        <button disabled={!startAt || !endAt || !guests} onClick={this.confirmProposedData} className="btn btn-bwm btn-confirm btn-block">
          Reserve place now
        </button>
        <hr />
        <p className="booking-note-title">
          People are interested into this house
        </p>
        <p className="booking-note-text">
          More than 500 people checked this rental in last month.
        </p>
        <BookingModal booking={this.state.proposedBooking} closeModal={this.cancelConfirmation} open={this.state.modal.open} />
      </div>
    );
  }
}
