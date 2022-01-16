const mongoose = require('mongoose');
const { boatSchema } = require('../models/boat.js');
const { userSchema } = require('../models/user.js');
const { clubSchema } = require('../models/club.js');
const { raceSchema } = require('../models/race.js');
const { classSchema } = require('../models/class.js');
const { serieSchema } = require('../models/serie.js');
const { handicapSchema } = require('../models/handicap.js');
const { checkpointSchema } = require('../models/checkpoint.js');

/**
 * Mongoose Connection
**/

mongoose
	.connect('mongodb://192.168.0.118/klubbsegling_1', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('connected to mongodb'))
	.catch((err) => console.log(err))

const Boat = mongoose.model('Boat', boatSchema);
const User = mongoose.model('User', userSchema);
const Club = mongoose.model('Club', clubSchema);
const Race = mongoose.model('Race', raceSchema);
const Class = mongoose.model('Class', classSchema);
const Serie = mongoose.model('Serie', serieSchema);
const Handicap = mongoose.model('Handicap', handicapSchema);
const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);


export { Boat, User, Club, Race, Class, Serie, Handicap, Checkpoint };