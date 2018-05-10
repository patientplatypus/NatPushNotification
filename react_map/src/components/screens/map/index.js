import React, { Component } from 'react';

import WebSocket from 'ws';
import axios from 'axios';
import renderIf from 'render-if';
import io from 'socket.io-client'

class Map extends Component {
    constructor(props){
        super(props);
        this.state = {
            GPS: []
        }
        this.connection = null;
        this.socket = io(`http://localhost:8080`);
    }

    componentDidMount(){  
        this.socket.on(`GPS`, data => {
            var GPSarray = this.state.GPS
            GPSarray.push(data)
            this.setState({ 
                GPS:GPSarray
            }, ()=>{
                console.log("after setState and GPS is ", this.state.GPS);
            })
        })
    }

    testHandler(){
        console.log('inside testHandler');
        this.socket.emit(`test`, "yolo");
    }

    subscribeHandler(){
        console.log("inside subscribeHandler");
        this.socket.emit("subscribeGPS");
    }
    unsubcribeHandler(){
        console.log("inside unsubcribeHandler");
        this.socket.emit("unsubscribeGPS");
    }
    closeHandler(){
        console.log("inside closeHandler");
        this.socket.emit("closeConnection");
    }

  render() {
    return (
        <div>
            <p>
                hello there map
            </p>
            <br/>
            <button onClick={()=>{this.subscribeHandler()}}>Subscribe</button>
            <br/>
            <button onClick={()=>{this.unsubcribeHandler()}}>Unsubscribe</button>
            <br/>
            <button onClick={()=>{this.closeHandler()}}>Close Nats</button>
            <br/>
            <div>
                <p>
                    Here is the value of the GPS data
                </p>
            </div>   
            <br/>
            <div>
                {this.state.GPS}
            </div>
        </div>
    );
  }
}

export default Map;



// const Echo = React.createClass({
//     getInitialState(){
//       return { messages : [] }
//     },
//     componentDidMount(){
//       // this is an "echo" websocket service for testing pusposes
//       this.connection = new WebSocket('wss://echo.websocket.org');
//       // listen to onmessage event
//       this.connection.onmessage = evt => { 
//         // add the new message to state
//           this.setState({
//           messages : this.state.messages.concat([ evt.data ])
//         })
//       };
  
//       // for testing: sending a message to the echo service every 2 seconds, 
//       // the service sends it right back
//       setInterval( _ =>{
//           this.connection.send( Math.random() )
//       }, 2000 )
//     },
//     render: function() {
//       // render the messages from state:
//       return <ul>{ this.state.messages.map( (msg, idx) => <li key={'msg-' + idx }>{ msg }</li> )}</ul>;
//     }
//   });