import React, { Component } from 'react';

import WebSocket from 'ws';
import axios from 'axios';
import renderIf from 'render-if';
import io from 'socket.io-client'
// import 'mapbox-gl/dist/mapbox-gl.css';
// import mapboxgl from 'mapbox-gl';
import ReactMapboxGl, { Layer, Feature, Marker } from "react-mapbox-gl";
import styled from 'styled-components';
import glamorous from 'glamorous'

import key from '../../../../src/mapkey/key';

const MapBox = ReactMapboxGl({
    accessToken: key.key
});


// const Mark = styled.div`
//   background-color: #e74c3c;
//   border-radius: 50%;
//   width: 10px;
//   height: 10px;
// `;

// const MainMark = styled.div`
//   background-color: green;
//   border-radius: 50%;
//   width: 10px;
//   height: 10px;
// `;

// const BigLink = glamorous.a({
// 	border: '1px solid #F67982',
// 	width: '11em',
// 	padding: '0.7em 0',
// 	textDecoration: 'none',
// 	borderRadius: 4,
// 	display: 'inline-block',
// 	margin: '.5em 1em',
// 	transition: 'all .3s',
// }, ({primary}) => ({
// 		backgroundColor: primary ? '#CC3A4B' : 'rgba(255, 255, 255, 0.5)',
// 		color: primary ? '#fff' : '#DA233C',
// 		':hover': {
// 			backgroundColor: primary ? 'rgba(255, 255, 255, 0.5)' : '#CC3A4B',
// 			color: primary ? '#DA233C' : '#fff',
// 		}
// }))

const Mark = glamorous.div({
    backgroundColor: "green",
    borderRadius: "50%",
    width: "10px",
    height: "10px",
  },
  ({colorIndex})=>({
      backgroundColor: colorIndex?"green":"red"
  })
)

class Map extends Component {
    constructor(props){
        super(props);
        this.state = {
            GPS: [],
            zoom: 10,
            center: {
                lat: 30.2672, 
                lng: -97.7431
            }
        }
        this.connection = null;
        this.socket = io(`http://localhost:8080`);

    }

    componentDidMount() {
        this.socket.on(`GPS`, data => {
            var GPSarray = this.state.GPS
            GPSarray.push(JSON.parse(data))
            this.setState({ 
                GPS:GPSarray
            }, ()=>{
                console.log("after setState and GPS is ", this.state.GPS);
            })
        })
    }

    startLooper(){
        console.log('inside startLooper');
        axios.post("http://localhost:3000/GPSlooper", {
            timeout: 1500
        })
        .then(response=>{
            console.log("response from GPSlooper: ", response);
        })
        .catch(error => {
            console.log("error from GPSlooper: ", error);
        });
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
            <br/>
            <button onClick={()=>{this.startLooper()}}>Start Car</button>
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
            <div style={{marginLeft:"20vw"}}>
                <MapBox
                style="mapbox://styles/mapbox/streets-v9"
                center={[this.state.center.lng,this.state.center.lat]}
                zoom={[this.state.zoom]}
                containerStyle={{
                    height: "60vh",
                    width: "60vw"
                }}>
                    {[...Array(this.state.GPS.length)].map((x, i) =>
                        <Marker coordinates={[this.state.GPS[i][0], this.state.GPS[i][1]]}>
                            <Mark colorIndex={i==this.state.GPS.length-1}/>
                        </Marker>
                    )}
                </MapBox>
            </div>
        </div>
    );
  }
}

export default Map;

// {[...Array(this.state.GPS.length)].map((x, i) =>
//     <Marker coordinates={[this.state.GPS[i]]}>
//         <Mark />
//     </Marker>
// )}

{/* <Marker coordinates={[this.state.GPS[0][0], this.state.GPS[0][1]]}>
<Mark />
</Marker> */}

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