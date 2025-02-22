import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AppRoutes from './AppRoutes';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appName: 'React-v16',
      context: {
        userName: 'jason-in-app',
      },
    };
    this.initialData = {};

    const initDataScript = document.getElementById('__INITIAL_DATA__');
    if (initDataScript) {
      try {
        this.initialData = JSON.parse(initDataScript.innerText);
      } catch (err) {
        console.error(err);
      }
    }
    console.log('this.initialData: ', this.initialData);
  }
  render() {
    return (
      <Router>
        <AppRoutes
          context={this.state.context}
          initialData={this.initialData}
        />
      </Router>
    );
  }
}

export default App;
