var mongoose = require("mongoose");

var pollSchema = new mongoose.Schema({
   title: String,
   question: String,
   image: { type :String, default : 'http://www.pacinno.eu/wp-content/uploads/2014/05/placeholder1.png' } ,
   answers: [],
   date : { type: Date, default: Date.now },
   author : {
      id :{ 
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
         },
         username : String
   }


//   comments: [
//       {
//          type: mongoose.Schema.Types.ObjectId,
//          ref: "Comment"
//       }
//   ]
//   author : {
//       id :{ 
//          type: mongoose.Schema.Types.ObjectId,
//          ref: "User"
//          },
//          username : String
//   }
         
   
});

module.exports = mongoose.model("Poll", pollSchema);