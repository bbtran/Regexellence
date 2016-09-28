const mongoose = require('mongoose');
const models = require('./dbmodel');

// Below is to fix deprecated mongoose promise.
mongoose.Promise = global.Promise;
const Challenges = models.Challenges;

const parseChallengeName = require('../utils').parseChallengeName;

module.exports = {
  getChallenges: (callback) => {
    models.Challenges.find({}, (err, challenges) => {
      if (err) throw err;
      callback(challenges);
    });
  },
  postChallenge: (challengeObject, callback) => {
    challengeObject._id = mongoose.Types.ObjectId();
    challengeObject.nameurl = parseChallengeName(challengeObject.name);
    challengeObject.testPassed = false;
    console.log(challengeObject);
    const NewChallenge = new Challenges(challengeObject);
    NewChallenge.save((err, newData) => {
      if (err) throw err;
      callback(newData);
    });
  },
  postChallengeAnswer: (data, query, callback) => {
    console.log('in post challenge answer')
    const answer = { 
      answer: data.answer, 
      user: data.username || 'Anonymous',
      userId: data.userId || null
    }
    models.Challenges.findOneAndUpdate({ _id: query }, { $push: { answers: answer }}, { new: true }, (err, model) => {
      if (err) throw err;
      callback(model);
    });
  },
  postCompletedChallenge: (challengeId, userId, callback) => {
    models.Users.findOneAndUpdate({ _id: userId }, { $push: { completed_challenges: challengeId }}, { new: true }, (err, model) => {
      if (err) throw err;
      callback(model);
    });
  },
  findUserCompletedChallenges: (userId, callback) => {
    models.Users.find({ _id: userId }, (err, userData) => {
      console.log('completed challenges ', mongoose.Types.ObjectId(userData[0].completed_challenges[0]));
      const { completed_challenges } = userData[0];
      models.Challenges.find({ _id: { $in: completed_challenges }}, (err, challenges) => {
        callback(challenges);
      });
    });
  },
  getTutorial: (callback) => {
    models.Tutorial.find({}, (err, tutorial) => {
      if (err) throw err;
      callback(tutorial);
    });
  },
  getUserInfo: (_id, callback) => {
    models.Users.findOne({ _id }, (err, data) => {
      if (err) throw err;
      callback(data);
    });
  },
};

// TODO: Helper function for retrieving challenge info. 
// function getChallengesById(idArray, callback) {
//   idArray.forEach((id) => {
//     models.Challenges.find({}, (err, challenge) => {
//       if (err) throw err;

//     })
//   })
  
// }
