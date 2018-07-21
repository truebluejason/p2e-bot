module.exports = {
	extractTimes: extractTimes,
	adjustedTime: adjustedTime,
	getTimeOffset: getTimeOffset
}

// returns array of strings and error
function extractTimes(userResp) {
	let times = userResp.match(/(^[0-1]?[0-9]|\D[0-1]?[0-9]|^2[0-3]|\D2[0-3]):[0-5][0-9]( ?[AP]M)?/gi);
	if (times) {
		times = times.map(formatTime);
		error = times.find(time => time === 'INVALID') ? new Error('Invalid time is present in user response.') : null;
		return { times: times, error: error };
	} else {
		return { times: null, error: new Error('No valid time is present in user response.') };
	}
}

// returns time string in the form xx:xx from variety of inputs
function formatTime(time) {
	time = time.trim();
	if (time.includes("AM")) {
		time = time.match(/(^0?[0-9]|^1[0-2]):[0-5][0-9]/gi);
		if (!time) return 'INVALID';
		let
			hour = time[0].split(":")[0],
			rest = time[0].split(":")[1];
		return hour !== "12" ? time[0] : `${(parseInt(hour) - 12).toString()}:${rest}`;
	}
	if (time.includes("PM")) {
		time = time.match(/(^0?[0-9]|^1[0-2]):[0-5][0-9]/gi);
		if (!time) return 'INVALID';
		let
			hour = time[0].split(":")[0],
			rest = time[0].split(":")[1];
		return hour !== "12" ? `${(parseInt(hour) + 12).toString()}:${rest}` : time[0];
	}
	return time[0];
}

// returns server's time
function adjustedTime(time, offset) {
	let
		userHour = parseInt(time.split(":")[0]),
		rest = time.split(":")[1],
		utcHour = userHour - offset;

	if (utcHour > 23) utcHour = utcHour - 24;
	if (utcHour < 0) utcHour = utcHour + 24;

	return `${utcHour}:${rest}`;
}

// returns time offset between UTC and given time string, assuming server timezone is UTC
function getTimeOffset(time) {
	let
		userHour = parseInt(time.split(":")[0]),
		utc = new Date().getHours();

	let offset = userHour - utc;
	if (offset > 12) offset = offset - 24;
	if (offset < -12) offset = 24 + offset;

	return offset;
}
