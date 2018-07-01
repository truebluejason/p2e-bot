module.exports = {
	extractTimes: extractTimes,
	formatTime: formatTime
}

// returns array of strings and error
function extractTimes(userResp) {
	let times = userResp.match(/([0-1]?[0-9]|2[0-3]):[0-5][0-9]/gi);
	if (times) {
		return { times: times, error: null };
	} else {
		return { times: null, error: new Error('No valid time is present in user response.') };
	}
}

function formatTime(timeStr) {
	return null;
}