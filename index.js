let mysql = require('mysql');
let config = require('./config.js');
const connection = config.connectToDatabase();

let data = JSON.parse( `
	{
		"station_id": 1,
		"sensors":
		[
			{"sensor_id": 10,
			"measurement": 40.9},
			{"sensor_id": 6,
			"measurement": 14},
			{"sensor_id": 2,
			"measurement": -0.5}
		]
	}
	`);


let datenow = new Date(Date.now()).toLocaleString();

function dataPulseReceived(data, timenow){
	for(let i = 0; i < data.sensors.length; i++){
		let sql = `INSERT INTO sensordata (measurement_time, sensor_id, station_id, measurement)
							VALUES ("${timenow}", ${data.sensors[i].sensor_id}, ${data.station_id}, ${data.sensors[i].measurement})`;
			connection.query(sql, function(error, results){
			if(error) reject(error);
			else console.log(data.sensors.length + " rows added successfully to the database");
		});
	}
}


testFunction();
//Testing what all the functions print out
function testFunction(){
	connection.connect();

	dataPulseReceived(data, datenow);

	selectSpecificSensorData(7).then(results => {
		results = JSON.parse(JSON.stringify(results));
		console.log(results);
	});
	selectSpecificSensorData(4).then(results => {
		console.log(results);
	});
	selectSpecificSensorData(2).then(results => {
		console.log(results);
		connection.end();
	});

	getAllSensorData().then(results => {
		console.log(results);
	});

	let gps = '60.17 24.94';
	getSensorDataByLocation(gps).then(results => {
		console.log(results);
	});

	changeStationStatus('1', 'error').then(results => {
		console.log(results);
	});

	changeStationStatus(1, 'error').then(results => {
		console.log(results);
	});

	console.log("hello"); //This might be printed before those above since they are send to another function (asynchronous) and it will take time until they are finished. They are executed parallel.
}


function selectSpecificSensorData(sensor_id){
	let sql = `SELECT measurement FROM sensordata WHERE sensor_id = ${sensor_id}`;
	return new Promise((resolve, reject) =>{
			connection.query(sql, (error, results) =>{
				if(error) reject(error);
				else if(results.length === 0) resolve('No records found');
				else {
				resolve(`Results from sensor_id ${sensor_id}: ` + JSON.stringify(results));
				}
			});
	});
}

function changeStationStatus(station_id, station_status){
	let sql = `UPDATE station
						SET station_status = "${station_status}"
						WHERE station_id = ${station_id}`;
	return new Promise((resolve, reject) => {
		connection.query(sql, (error, results) => {
			if(error) reject(error);
			else if(typeof station_id !== 'number'){
				resolve('Station id needs to be a number.')
			}
			else{
				resolve(`Station ${station_id} status changed to ${station_status}`);
			}
		});
	});
}

function getAllSensorData(){
	let sql = `SELECT * FROM sensordata`;
	return new Promise((resolve, reject) => {
		connection.query(sql, (error, results) => {
			if(error) reject(error);
			else {
				resolve(JSON.stringify(results));
			}
		});
	});
}

function getSensorDataByLocation(gps){
	let sql = `SELECT sensordata.*
						FROM sensordata, sensor, station
						WHERE station.GPS = '60.17 24.94'
						AND sensor.station_id = sensordata.station_id
						AND station.station_id = sensor.station_id`;
	return new Promise((resolve, reject) => {
		connection.query(sql, (error, results) => {
			if(error) reject(error);
			else if (results.length === 0) resolve('No records found');
			else {
				resolve('Results from location ' + gps + ': ' + JSON.stringify(results));
			}
		});
	});
}
