// Initialize connection




/*class Database {
    sql;
    conn;

    constructor(sqlRequire, sqlHost, sqlUser, sqlPass, sqlDb="") {
        this.sql = sqlRequire;

        this.conn = sql.createConnection({
            host: sqlHost,
            user: sqlUser,
            password: sqlPass,
            database: sqlDb
        })

        this.conn.connect((error) => {
            if (error)  {
                throw error;
            }
            console.log("Established connection to SQL server.")
        })
    }
}*/

class TriviaBot {
    createdMsg; // Message Sent by user
    client; // Discord API/Client
    content;
    username;
    user4DigitTag;
    userID;
    triviaAPIKey;
    conn;

    constructor(createdMsg, bot, msgContent, username, user4DigitTag, userID, triviaAPIKey) {
        this.createdMsg = createdMsg;
        this.client = bot;
        this.content = msgContent;
        this.username = username;
        this.user4DigitTag = user4DigitTag;
        this.userID = userID;
        this.triviaAPIKey = triviaAPIKey;
        //this.conn = conn;
    }

    msgIsCommand() {
        var msg = this.content;
        let firstChar = msg.charAt(0);
        if (firstChar == "~") {
            return true;
        } else {
            return false;
        }
    }

    whatIsCommand() {
        /* list of commands:
        hi: Response with "Hello!"
        */

        var msg = this.content;
        let command = msg.slice(1);
        
        var cmd = new BotCommands(this.createdMsg, this.client, command, this.triviaAPIKey);
        switch (command) {
            case "hi":
                cmd.hi();
                break;
            case "test":
                cmd.test();
                break;
            case "startTrivia":
                cmd.startTriviaGame();
                break;
            case "addTriviaAdmin":
                cmd.addMoreTrivia();
                break;
            default:
                break;
        }
    }
}

function startConnection(sql) {
    conn = sql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "quietwindstrivia"
    })
    conn.connect((error) => {
        if (error)  {
            throw error;
        }
        console.log("Established connection to SQL server.")
        return conn;
    })
}

function arrayShuffle(array) {
    // Fisher-Yates algo, found: https://bost.ocks.org/mike/shuffle/ src here: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    let currentIndex = array.length,  randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
}

class BotCommands {
    command;
    createdMsg; // Message Sent by user
    client; // Discord API/Client
    triviaAPIKey;
    conn;

    constructor(createdMsg, bot, cmd, triviaAPIKey) {
        this.createdMsg = createdMsg;
        this.client = bot;
        this.command = cmd;
        this.triviaAPIKey = triviaAPIKey;
        //this.conn = conn;
    }

    test() {
        var msg = this.createdMsg;
        // Random code in here depending on test being ran
        //const array = ["One", "two", "three", "four"];
        //console.log(array.indexOf("One"))

        const data = {"response_code":0,"results":[{"category":"Geography","type":"multiple","difficulty":"medium","question":"Which country inside the United Kingdom does NOT appear on its flag, the Union Jack?","correct_answer":"Wales","incorrect_answers":["Scotland","Ireland","Isle of Wight"]}]};
        var category = data[0].category;

        console.log(data[0].category)
    }

    addMoreTrivia() {
        var msg = this.createdMsg;
        startConnection();
        const request = require('request');
        //var category = "geography";
        setInterval(() => {
            request.get({
                // https://opentdb.com/api_config.php
                url: `https://opentdb.com/api.php?amount=1&category=22&type=multiple`,
                /*headers: {
                  "X-Api-Key": this.triviaAPIKey
                },*/
            }, function (error, response, body) {
                if (error) {throw error;}
                var data = JSON.parse(body);
                var results = data["results"][0];
                var category = results.category;
                var type = results.type;
                var difficulty = results.difficulty;
                var question = results.question;
                var correct = results.correct_answer;
                var incorrectAnswerArray = results.incorrect_answers;
                var wrong1 = incorrectAnswerArray[0];
                var wrong2 = incorrectAnswerArray[1];
                var wrong3 = incorrectAnswerArray[2];
                conn.query(`INSERT INTO questions (category, type, difficulty, question, correct, answ1, answ2, answ3) VALUES ("${category}", "${type}", "${difficulty}", "${question}", "${correct}", "${wrong1}", "${wrong2}", "${wrong3}")`, (error, result) => {
                    if (error) {throw error;}
                })
            });
        }, 5000);
    }

    hi() {
        var msg = this.createdMsg;
        msg.reply("Hello!");
    }

    startTriviaGame() {
        var msg = this.createdMsg;
        var counter = 1;
        var currentPoints = 0;

        const sql = require("mysql");
        startConnection(sql);

        questionControls(msg, counter, currentPoints, this.conn);
    }
}




function answerArrayShuffle(array) {
    const shuffledArray = arrayShuffle(array);
    return shuffledArray;
}

function getIndexedAnswer(array, valueToIndex) {
    const indexedAnswer = array.indexOf(valueToIndex) + 1;
    return indexedAnswer;
}

function respondWithCorrect(currentPoints) {
    const correct = `**Correct!!!** + 15 points!!! **(${currentPoints} total)** \n Next question...`;
    return correct;
}

function respondWithIncorrect(currentPoints, correctAnswerValue, correctAnswerIndex) {
    const incorrect = `**INCORRECT!** - 5 points. **(${currentPoints} total)** \n Maybe next time! The correct answer was: ${correctAnswerIndex}) ${correctAnswerValue}`;
    return incorrect;
}

async function fetchChannel(channel_id) {
    const channel = await bot.channels.fetch(channel_id);
    return channel;
}

/*function selectQuestion(QUERY, conn) {
    // Execute query
    conn.query(QUERY, (error, result) => {
        if (error) {throw error;}
        var question = result[0].question;
        var correct = result[0].correct;
        var wrong1 = result[0].answ1;
        var wrong2 = result[0].answ2;
        var wrong3 = result[0].answ3;
        const array = [question, correct, wrong1, wrong2, wrong3];
        return array;
    })
}*/

function questionControls(MSG, counter, currentPoints) {
    // Declare INDEXED vars
    INDEXED_CORRECT_ANSWER = "";
    INDEXED_INCORRECT_ONE = "";
    INDEXED_INCORRECT_TWO = "";
    INDEXED_INCORRECT_THREE = "";
    // Select current question
    const QUERY = "SELECT * FROM questions WHERE qID=24 ORDER BY RAND() LIMIT 1";
    conn.query(QUERY, (error, result) => {
        if (error) {throw error;}
        var question = result[0].question;
        var correct = result[0].correct;
        var wrong1 = result[0].answ1;
        var wrong2 = result[0].answ2;
        var wrong3 = result[0].answ3;
        const QUESTION_ARRAY =  [question, correct, wrong1, wrong2, wrong3];
        // Split question from answer list and grab value of correct answer
        var ANSWER_ARRAY_UNSHUFFLED = [QUESTION_ARRAY[1], QUESTION_ARRAY[2], QUESTION_ARRAY[3], QUESTION_ARRAY[4]];
        const QUESTION = QUESTION_ARRAY[0];
        const CORRECT = QUESTION_ARRAY[1];
        const INCORRECT_ONE = QUESTION_ARRAY[2];
        const INCORRECT_TWO = QUESTION_ARRAY[3];
        const INCORRECT_THREE = QUESTION_ARRAY[4];
        // Shuffle the answer array and return new:
        let ANSWER_ARRAY = answerArrayShuffle(ANSWER_ARRAY_UNSHUFFLED);
        // Get indexed correct answers:
        let INDEXED_CORRECT_ANSWER = getIndexedAnswer(ANSWER_ARRAY, CORRECT);
        let INDEXED_INCORRECT_ONE = getIndexedAnswer(ANSWER_ARRAY, INCORRECT_ONE);
        let INDEXED_INCORRECT_TWO = getIndexedAnswer(ANSWER_ARRAY, INCORRECT_TWO);
        let INDEXED_INCORRECT_THREE = getIndexedAnswer(ANSWER_ARRAY, INCORRECT_THREE);
        // Ask question
        MSG.reply(`Question ${counter}: ${QUESTION} \n 1) ${ANSWER_ARRAY[0]} \n 2) ${ANSWER_ARRAY[1]} \n 3) ${ANSWER_ARRAY[2]} \n 4) ${ANSWER_ARRAY[3]}`);
        bot.on("messageCreate", (userReply) => {
            if (!userReply.author.bot && userReply.author.id !== bot.user.id) {
                console.log(
`
--------------------------------------------------------------------------------------------------------
***DIAGNOSTICS FOR #${counter}***
MSG CONTENT: ${userReply.content}
IS BOT MESSAGE (msg.author.bot): ${userReply.author.bot}
Message author ID (msg.author.id): ${userReply.author.id}
Bot's User ID (bot.user.id): ${bot.user.id}

Question Counter: ${counter}
currentPoints: ${currentPoints}

--Answers before shuffle--
CORRECT: ${correct}
WRONG1: ${wrong1}
WRONG2: ${wrong2}
WRONG3: ${wrong3}

--Answers after shuffle--
CORRECT: ${INDEXED_CORRECT_ANSWER}
INDEXED_INCORRECT_ONE: ${INDEXED_INCORRECT_ONE}
INDEXED_INCORRECT_TWO: ${INDEXED_INCORRECT_TWO}
INDEXED_INCORRECT_THREE: ${INDEXED_INCORRECT_THREE}

QUESTION_ARRAY: ${QUESTION_ARRAY}
ANSWER_ARRAY_UNSHUFFLED: ${ANSWER_ARRAY_UNSHUFFLED}
ANSWER_ARRAY (SHUFFLED): ${ANSWER_ARRAY}

`
                );
                if (userReply.content === `~${INDEXED_CORRECT_ANSWER}`) {
                    // Get channel ID & channel
                    const CHANNEL_ID = userReply.channelId;
                    const CHANNEL = fetchChannel(CHANNEL_ID);
                    // Increment question counter & points
                    counter++;
                    currentPoints = currentPoints + 15;
                    // Send message to channel
                    //CHANNEL.send(respondWithCorrect(currentPoints));
                    userReply.reply(respondWithCorrect(currentPoints));
                    console.log(
`

***DIAGNOSTICS FOR #${counter} PART 2 (AFTER FUNCTION END)***
CHANNEL_ID: ${CHANNEL_ID}
CHANNEL: ${CHANNEL}
COUNTER AFTER: ${counter}
CURRENT POINTS AFTER: ${currentPoints}
MSG CONTENT AFTER: ${userReply.content}
userReply Variable data: ${userReply}
--------------------------------------------------------------------------------------------------------
`
                    )
                    // Reiterate
                    questionControls(userReply, counter, currentPoints);
                }
            }
        })
    })
}


function questionControls1(msg, counter, currentPoints) {
    conn.query("SELECT * FROM questions WHERE qID=24 ORDER BY RAND() LIMIT 1", (error, result) => {
        if (error) {throw error;}
        var question = result[0].question;
        var correct = result[0].correct;
        var wrong1 = result[0].answ1;
        var wrong2 = result[0].answ2;
        var wrong3 = result[0].answ3;
        var answerArray = [correct, wrong1, wrong2, wrong3];
        var shuffledAnswerArray = arrayShuffle(answerArray); // There should always be exactly indexes 0-3 (4 items)

        var indexedCorrectAnswer = shuffledAnswerArray.indexOf(correct) + 1;
        var indexedWrong1 = shuffledAnswerArray.indexOf(wrong1) + 1;
        var indexedWrong2 = shuffledAnswerArray.indexOf(wrong2) + 1;
        var indexedWrong3 = shuffledAnswerArray.indexOf(wrong3) + 1;

        msg.reply(`${counter}. ${question} \n 1) ${shuffledAnswerArray[0]} \n 2) ${shuffledAnswerArray[1]} \n 3) ${shuffledAnswerArray[2]} \n 4) ${shuffledAnswerArray[3]}`).then(() => {
            bot.on("messageCreate", (userReply) => {
                console.log()
                var respondedAnswer = userReply.content;
                if (msg.author.id === bot.user.id) {
                    console.log("THIS IS A BOT MESSAGE!");
                    return;
                }
                console.log(
`
DIAG:
Message from: ${msg.author.username}
Bot message: ${msg.author.bot}
msg.author.id: ${msg.author.id}
bot.user.id: ${bot.user.id}
Responded Answer: ${respondedAnswer}
indexedCorrectAnswer: ${indexedCorrectAnswer}
indexedWrong1: ${indexedWrong1}
indexedWrong2: ${indexedWrong2}
indexedWrong3: ${indexedWrong3}
"Correct answer was" response: indexedCorrectAnswer -> ${indexedCorrectAnswer}) answerArray[0] -> ${answerArray[0]}
answerArray (Origin): ${answerArray}
shuffledAnswerArray: ${shuffledAnswerArray}
counter before: ${counter}
currentPoints before: ${currentPoints}
`
);
                if (respondedAnswer === `~${indexedCorrectAnswer}`) {
                    counter++;
                    currentPoints = currentPoints + 15;
                    userReply.react("🙂");
                    userReply.reply(`**Correct!!! + 15 points!!! (${currentPoints} total)** \n Next question...`);
                    questionControls(userReply, counter, currentPoints);
                } else if (respondedAnswer === `~${indexedWrong1}` || respondedAnswer === `~${indexedWrong2}` || respondedAnswer === `~${indexedWrong3}`) {
                    counter++;
                    currentPoints = currentPoints - 5;
                    userReply.react("🙄");
                    userReply.reply(`**INCORRECT! - 5 points. (${currentPoints} total)** \n Maybe next time! The correct answer was: ${indexedCorrectAnswer}) ${answerArray[0]}`);
                }
            })
        })
    })
}









bot.on("messageCreate", (msg) => {
    let msgChannelID = msg.channelId
    let msgServerID = msg.guildId
    let msgTimeStamp = msg.createdTimestamp
    let sentByUserID = msg.author.id
    let sentByUsername = msg.author.username
    let sentByUser4DigitTag = msg.author.discriminator
    let content = msg.content
    //console.log(`USERID: ${sentByUserID} | USERNAME: ${sentByUsername}#${sentByUser4DigitTag} || MSG: ${content}`)

    var checks = new TriviaBot(msg, bot, content, sentByUsername, sentByUser4DigitTag, sentByUserID, _TRIVIA_API_TOKEN_)
    var isCommand = checks.msgIsCommand() // Bool
    if (isCommand == true) {
        checks.whatIsCommand()
    }
})






// TESTING

/*const data = {"response_code":0,"results":[{"category":"Geography","type":"multiple","difficulty":"medium","question":"Which country inside the United Kingdom does NOT appear on its flag, the Union Jack?","correct_answer":"Wales","incorrect_answers":["Scotland","Ireland","Isle of Wight"]}]};



console.log(wrong2)*/