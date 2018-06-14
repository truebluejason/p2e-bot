module.exports = {
	evalMessage: evalMessage,
};

function evalMessage(userID, message) {
	console.log('evaluated');
	// get user's state
	// run validators (identify possible next action) on message
	// if match, call that action's send function
	// call waitState update in a promise
}

function evalPostback(userID, payload) {
	// get user's state
	// 
}

function evalPoll(userID) {

}