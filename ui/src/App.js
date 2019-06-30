import React, { Component } from 'react';
import logo from './isufit.gif';
import './App.css';
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Notification } from 'react-notification';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

class App extends Component {
    constructor() {
        super();
        this.state = { email: "", isufitNum: "", arriveHour: 9, departHour: 18, reportingDays:[true, true, true, true, true],//Sunday - Thursday by index
            notification: {
                message: "",
                active: false,
                action: 'Dismiss'
            },
            admin: {
                pass: "",
                enableAdminScreen: false,
                excludedDates: [],
                currDate: moment()
            }
        };

    }

    updateStateOf = (field, value) => {
        let state = this.state;
        state[field] = value;
        this.setState(state);
    };

    updateNotificationState = (message, active = true) => {
        let state = this.state;
        let noti = state.notification;
        noti.message = message;
        noti.active = active;
        this.setState(state);
    };

    onEmailChange = e => {
        this.updateStateOf('email', e.target.value);
    };

    onCardNumChange = e => {
        this.updateStateOf('isufitNum', e.target.value);
    };

    onDepartChange = e => {
        this.updateStateOf('departHour', e.target.value);
    };

    onArrivalChange = e => {
        this.updateStateOf('arriveHour', e.target.value);
    };

    onPassChange = e => {
        let state = this.state;
        state.admin.pass = e.target.value;
        if (e.target.value === 'dorhilakeren') {
            state.admin.enableAdminScreen = true;

            fetch('/getExcludedDates',
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    if (response.status >= 400) {
                        this.updateNotificationState(`Bad response from server: ${response.message}`);
                    }
                    else {
                        return response.json();
                    }
                })
                .then((res) => {
                    if (res.error) {
                        this.updateNotificationState(`Failed to get excluded dates: ${res.message}`);
                    }
                    else {
                        console.log(`got excludedDates from server: ${res.excludedDates}`);
                        state.admin.excludedDates = res.excludedDates;
                        this.setState(state);
                    }
                })
                .catch(ex => {
                    this.updateNotificationState(`Failed to get excluded dates: ${ex.message}`);
                });
        }
        else {
            this.setState(state);
        }

    };

    onDateChange = date => {
        let state = this.state;
        state.admin.currDate = date;
        this.setState(state);
    };

    onExcludeClick = e => {
        let state = this.state;
        state.admin.excludedDates.push(state.admin.currDate.format('DD/MM/YYYY'));
        this.setState(state);
    };

    onDoNotExclude = () => {
        return (index) => {
            let state = this.state;
            let excludedDates = state.admin.excludedDates;
            excludedDates.splice(index, 1);
            this.setState(state);
        };
    };

    onDayClick = (dayIndex) => {
        return () => {
            let state = this.state;
            let reportDays = state.reportingDays;
            reportDays[dayIndex] = !reportDays[dayIndex];
            this.setState(state);
        }
    };

    onSaveExclude = e => {
        let state = this.state;
        let dates = state.admin.excludedDates;

        let post = {
            excludedDates: dates
        };
        console.log(`calling excludeDates with ${JSON.stringify(post)}`);
        fetch('/excludeDates',
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(post),
            })
            .then((response) => {
                if (response.status >= 400) {
                    this.updateNotificationState(`Bad response from server: ${response.message}`);
                }
                else {
                    return response.json();
                }
            })
            .then((res) => {
                if (res.error) {
                    this.updateNotificationState(`Failed to save excluded dates: ${res.message}`);
                }
                else {
                    this.updateNotificationState(`Successfully saved excluded dates, see you next year Keren...`);
                }
            })
            .catch(ex => {
                this.updateNotificationState(`Failed to save excluded dates: ${ex.message}`);
            });
    };

    registerUser = e => {
        function getReportingDays(stateDays) {
            let reportingDays = [];
            for (let i = 0; i < stateDays.length; i++) {
                if (stateDays[i]) {
                    reportingDays.push(i);
                }
            }
            return reportingDays;
        }
        let post = {
            email: this.state.email,
            isufitNum: this.state.isufitNum,
            arriveHour: parseInt(this.state.arriveHour, 10) + new Date().getTimezoneOffset() / 60, // we want the time in UTC in the server
            departHour: parseInt(this.state.departHour, 10) + new Date().getTimezoneOffset() / 60,
            reportingDays: getReportingDays(this.state.reportingDays)
        };
        console.log(`calling register with ${JSON.stringify(post)}`);
        fetch('/register',
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(post),
            })
            .then((response) => {
                if (response.status >= 400) {
                    this.updateNotificationState(`Bad response from server: ${response.message}`);
                }
                else {
                    return response.json();
                }
            })
            .then((res) => {
                if (res.error) {
                    this.updateNotificationState(`Failed to register: ${res.message}`);
                }
                else {
                    this.updateNotificationState(`Successfully registerd you to Isufit automation. You will get 2 daily emails 
                    reporting you the arrival and departure time, or if there was any issue in the Isufit report`);
                }
            })
            .catch(ex => {
                this.updateNotificationState(`Failed to register: ${ex.message}`);
            });
    };

    unregisterUser = e => {
        let post = {
            email: this.state.email
        };
        console.log(`calling unregister with ${JSON.stringify(post)}`);
        fetch('/unregister',
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(post),
            })
            .then((response) => {
                if (response.status >= 400) {
                    this.updateNotificationState(`Bad response from server: ${response.message}`);
                }
                else {
                    return response.json();
                }
            })
            .then((res) => {
                if (res.error) {
                    this.updateNotificationState(`Failed to un-register: ${res.message}`);
                }
                else {
                    this.updateNotificationState(`Successfully un-registerd you from Isufit automation`);
                }
            })
            .catch(ex => {
                this.updateNotificationState(`Failed to register: ${ex.message}`);
            });

    };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Isufit Automation - Make your life better</h1>
            <h5>Donated to BioCatch employees (and for the sake of Keren Hila-Dor happiness) with love from Yehuda Sabag</h5>
        </header>
        <Tabs>
            <TabList>
                <Tab>Register to Isufit automation</Tab>
                <Tab>Un-Register from Isufit automation</Tab>
                <Tab>Admin - exclude vacation days reporting </Tab>
            </TabList>

            <TabPanel>
                <div>
                    Insert your biocatch email: <input type="email" id="register-email" value={this.state.email}
                                                       ref="register-email" onChange={this.onEmailChange}/>
                </div>
                <div>
                    Insert your isufit card number: <input id="register-cardnum" value={this.state.isufitNum}
                                                           ref="register-cardnum" onChange={this.onCardNumChange} />
                </div>
                <div>
                    <p>
                        The system will report your arrival and departure time on the arrival\departure hour you enter
                        and will random the minutes in this hour. For example, if you choose arrival time of 8, the system
                        will random your arrival time between 8:00 - 8:59
                    </p>
                </div>
                <div>
                    Insert arrival time:
                    <select id="register-arrival" ref="register-arrival" onChange={this.onArrivalChange} value={this.state.arriveHour}>
                        {(hours => {
                            return hours.map((hour) => {
                                return <option key={`ariv_option${hour}`} value={hour}>{hour}</option>;
                            });
                        })([6, 7, 8, 9, 10, 11, 12, 13, 14])}
                    </select>
                </div>
                <div>
                    Insert departure time:
                    <select id="register-depart" ref="register-depart" onChange={this.onDepartChange} value={this.state.departHour}>
                        {(hours => {
                            return hours.map((hour) => {
                                return <option key={`depart_option${hour}`} value={hour}>{hour}</option>;
                            });
                        })([15, 16, 17, 18, 19, 20, 21, 22, 23, 24])}
                    </select>
                </div>
                <div>
                    <br/>
                    Select reporting days:
                    <br/>
                    {
                        (reportingDays => {
                            let weekDays = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday'];
                            return reportingDays.map((isChecked, i) => {
                                return <span key={`span_input_${i}`}>
                                    <input id={`input_${i}`} type="checkbox" key={`input_${i}`} defaultChecked={isChecked} onClick={this.onDayClick(i)} />
                                    <label htmlFor={`input_${i}`}>{weekDays[i]}</label>&nbsp;
                                    </span>
                            });
                        })(this.state.reportingDays)
                    }
                </div>
                <div>
                    <input type="button" id="register" ref="register" value="Register" onClick={this.registerUser} />
                </div>
            </TabPanel>
            <TabPanel>
                <div>
                    Insert your biocatch email: <input type="email" id="unregister-email" value={this.state.email}
                                                       ref="unregister-email" onChange={this.onEmailChange}/>
                </div>
                <div>
                    <input type="button" id="unregister" ref="unregister" value="Un-Register" onClick={this.unregisterUser} />
                </div>
            </TabPanel>
            <TabPanel>
                <div>This tab is for Keren usage only, not for personal use. Please do not use unless you are Keren</div>
                <div>
                    Hi Keren, please insert your password: <input type="password" ref="pass" value={this.state.admin.pass}
                                                                  onChange={this.onPassChange}/>
                    {
                        ((enableAdmin, excludedDates) => {
                            if (enableAdmin) {
                                return (
                                    <div>
                                        <DatePicker selected={this.state.admin.currDate} onChange={this.onDateChange}/>
                                        <button ref="exclude" onClick={this.onExcludeClick}>Exclude Date</button>
                                        <br/>
                                        <ul>
                                        {
                                            (() => {
                                                return excludedDates.map((date, i) => {
                                                    return <li key={`li_${date}`}>{date}
                                                        <button key={`not_exclude_${date}`} onClick={this.onDoNotExclude(i)}>Do not exclude</button>
                                                    </li>;
                                                });
                                            })()
                                        }
                                        </ul>
                                        <button ref="saveExclude" onClick={this.onSaveExclude}>Save all exclusions</button>
                                    </div>
                                )
                            }
                            else {
                                return <span/>
                            }
                        })(this.state.admin.enableAdminScreen, this.state.admin.excludedDates)
                    }
                </div>
            </TabPanel>
            <Notification message={this.state.notification.message} isActive={this.state.notification.active}/>
        </Tabs>
      </div>
    );
  }
}

export default App;
