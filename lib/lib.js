// Functions
function l(log) {
    console.log(log);
}



// Classes & Objects

class Message {
    // Properties
    bot;
    database;
    // For setting up trivia
    category; // 1: geography;
    difficulty; // 1: easy, 2: medium, 3: hard
    type; // 1: multiple-choice

    constructor() {
        this.database = new DB("localhost", "root", "", "quietwindstrivia");
        const {Client, IntentsBitField} = require("discord.js");
        require("dotenv").config();
        const _TOKEN_ = process.env.__TOKEN;
        const _TRIVIA_API_TOKEN_ = process.env.__TRIVIA_API_TOKEN;
        const bot = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMessageReactions
            ]
        });
        bot.on("ready", (b) => {
            l(`🙂 ${b.user.username} is ready!`)
        });
        bot.login(_TOKEN_);
        this.bot = bot;
    }

    // Methods
    msgIsCommand(msg) {
        if (msg.author.bot) {
            return false;
        }
        var msg = msg.content;
        let firstChar = msg.charAt(0);
        if (firstChar == "?") {
            return true;
        } else {
            return false;
        }
    }

    OnMessage() {
        this.bot.once("messageCreate", (msg) => {
            if (this.msgIsCommand(msg)) {
                this.RunCommand(msg);
                return true;
            } else {
                //console.log("\x1b[32m%s\x1b[0m", `${msg.guild}::${msg.channel} @${msg.author.username}: "${msg.content}"`);
                //l("Is bot message: " + msg.author.bot);
            }
        })
    }

    GetChannelID(msg) {
        return this.bot.channels.cache.get(msg.channelId);
    }

    SendToChannel(msg, toSend) {
        var channel = this.GetChannelID(msg);
        channel.send(toSend);
    }

    setDifficulty(msg, channelID, userID) {
        // First setup sequence
        if (this.difficulty == null || this.difficulty == undefined) {
            var channel = this.GetChannelID(msg);
            channel.send("What difficulty? \n 1 = Easy \n 2 = Medium \n 3 = Hard").then(() => {
                setTimeout(() => {
                    this.bot.once("messageCreate", (difficulty) => {
                        if (difficulty.author.id !== this.bot.user.id) {
                            var difficulty = difficulty.content;
                            if (difficulty.content == 1 || difficulty == "1") {
                                this.difficulty = difficulty;
                                return;
                            }
                            else if (difficulty == 2 || difficulty == "2") {
                                this.difficulty = difficulty;
                                return;
                            }
                            else if (difficulty == 3 || difficulty == "3") {
                                this.difficulty = difficulty;
                                return;
                            } else {
                                this.SendToChannel(difficulty, "Sorry, something went wrong configuring the game {fail at: difficulty}. Please try again or contact the developer.");
                                return; // Upon failure
                            }
                        }
                    })
                    return;
                }, 500);
                return;
            });
            var int = setInterval(() => {
                if (this.difficulty !== null && this.difficulty !== undefined) {
                    clearInterval(int);
                    this.setType(msg, channelID, userID);

                }
            }, 20);
            return;
        }
    }

    setType(msg, channelID, userID) {
        if (this.type == null || this.type == undefined) {
            var channel = this.GetChannelID(msg);
            channel.send("What type of questions do you want to be given? (Only multiple choice currently: Please send '1' as your message, without the quotes.").then(() => {
                setTimeout(() => {
                    this.bot.once("messageCreate", (type) => {
                        if (type.author.id !== this.bot.user.id) {
                            var type = type.content;
                            if (type == 1 || type == "1") {
                                this.type = type;
                                return;
                            } else {
                                this.SendToChannel(type, "Sorry, something went wrong configuring the game {fail at: type}. Please try again or contact the developer.");
                                return; // Upon failure
                            }
                        }
                    })
                    return;
                }, 500);
                return;
            });
            var int = setInterval(() => {
                if (this.type !== null && this.type !== undefined) {
                    clearInterval(int);
                    this.setCategory(msg, channelID, userID);
                }
            }, 20);
            return;
        }
    }

    setCategory(msg, channelID, userID) {
        if (this.category == null || this.category == undefined) {
            var channel = this.GetChannelID(msg);
            channel.send("Last question before we start! Which category do you want to have? \n 1 = Geography").then(() => {
                setTimeout(() => {
                    this.bot.once("messageCreate", (category) => {
                        if (category.author.id !== this.bot.user.id) {
                            var category = category.content;
                            if (category == 1 || category == "1") {
                                this.category = category;
                                // Start game if all is well
                                const StartTrivia = new Trivia(this.category, this.difficulty, this.type, msg, this.bot);
                                StartTrivia.Trivia(channelID, userID);
                                return;
                            }
                            else {
                                this.SendToChannel(category, "Sorry, something went wrong configuring the game {fail at: category}. Please try again or contact the developer.");
                                return; // Upon failure
                            }
                        } else return;
                    })
                    return;
                }, 500);
                return;
            });
            return;
        } else return;
    }

    // Make this the last method/item, for readability of this class:
    RunCommand(msg) {
        var content = msg.content;
        // Commands
        if (content == "?hello") this.SendToChannel(msg, "How are you?");
        if (content == "?trivia") {
            const channel = msg.channelId;
            const userID = msg.author.id;
            this.setDifficulty(msg, channel, userID);
            return;
        }
        
        // ADMIN COMMANDS:
        const adminID = 245705786150486016;
        if (msg.author.id == adminID) {
            // Admin commands list:

        }
    }
}

class Trivia {
    // Properties
    bot;
    database;
    msg; // Rarely used?
    authorID;
    userID;
    authorName;
    channelID;
    points;
    prevCounter;
    counter; // Question counter
    // Settings
    difficulty;
    category;
    type; // Multiple, etc
    addPoints;
    subtractPoints;

    constructor(category, difficulty, type, msg, bot, channel, userID) {
        this.database = new DB("localhost", "root", "", "quietwindstrivia");
        this.category = category;
        this.difficulty = difficulty;
        this.type = type;
        // From msg:
        this.bot = bot;
        this.msg = msg; // Rarely used property? Set for later use
        this.authorID = userID;
        this.authorName = msg.author.username;
        this.channelID = channel;
        this.points = 0;
        this.counter = 1;
        this.addPoints = 15;
        switch (difficulty) {
            case 1:
                this.subtractPoints = 5;
                this.difficulty = "Easy";
                break;
            case 2:
                this.subtractPoints = 10;
                this.difficulty = "Medium";
                break;
            case 3:
                this.subtractPoints = 15;
                this.difficulty = "Hard";
                break;
            default:
                this.subtractPoints = 10;
                this.difficulty = "Medium";
                break;
        }
        switch (category) {
            case 1:
                this.category = "geography";
                break;
        
            default:
                this.category = "geography";
                break;
        }
        switch (type) {
            case 1:
                this.type = "multiple";
                break;
        
            default:
                this.type = "multiple";
                break;
        }
    }

    // Methods
    AddPoints() {
        this.points = this.points + this.addPoints;
    }

    SubtractPoints() {
        this.points = this.points - this.subtractPoints;
    }

    NextQuestion(answer /*bool*/) {
        this.counter = this.counter + 1; // Set counter to next
        if (answer == true) {
            this.bot.channels.cache.get(this.msg.channelId).send(`CORRECT! +${this.addPoints} points! Next question!`); // Do not use Send() method for this as we are targeting specific channel
            this.AddPoints();
            this.Trivia();
        } else if (answer == false) {
            this.bot.channels.cache.get(this.msg.channelId).send(`WRONG! -${this.subtractPoints} points! Next question!`); // Do not use Send() method for this as we are targeting specific channel
            this.SubtractPoints();
            this.Trivia();
        } else {
            this.channelID.send("Something went wrong... please restart the game. If this issue persists, please contact the bot developer.");
        }
    }

    Send(msg, toSend) {
        // To respond to messages in non-specific channel
        const obj = new Message();
        obj.SendToChannel(msg, toSend);
    }

    TriviaSend(whatToSend, __callback) {
        // Send msg to specific channel
        this.bot.channels.cache.get(this.msg.channelId).send(whatToSend).then(__callback());
    }

    Trivia(channelID, userID) {
        if (channelID !== undefined) this.channelID = channelID;
        if (userID !== undefined) this.userID = userID;
        this.FetchQuestions((QuestionArray) => {
            const SHUFFLEDITEMS = this.ShuffleQuestion(QuestionArray);
            // Get the question & answer(s) values
            /* The following is current index placement for each item in "SHUFFLEDITEMS" array:
            0: Question (value)
            1: Array of shuffled answers (array)
            2: Index of correct answer inside "answers" array
            3: Index of wrong1 answer inside "answers" array
            4: Index of wrong2 answer inside "answers" array
            5: Index of wrong3 answer inside "answers" array
            */
            // Get values
            const question = SHUFFLEDITEMS[0]; // Value
            const answ1 = SHUFFLEDITEMS[1][0]; // Value
            const answ2 = SHUFFLEDITEMS[1][1]; // Value
            const answ3 = SHUFFLEDITEMS[1][2]; // Value
            const answ4 = SHUFFLEDITEMS[1][3]; // Value
            // Indexes
            const correctIndex = SHUFFLEDITEMS[2]; // Index
            const wrong1Index = SHUFFLEDITEMS[3]; // Index
            const wrong2Index = SHUFFLEDITEMS[4]; // Index
            const wrong3Index = SHUFFLEDITEMS[5]; // Index
            // Below is the answIndex + 1, so if the correct answer's index is 1, the answer responded by the user should be 2, since arrays start at 0 as index
            const correct = correctIndex + 1;
            const wrong1 = wrong1Index + 1;
            const wrong2 = wrong2Index + 1;
            const wrong3 = wrong3Index + 1;
            l(`Correct answer: ${SHUFFLEDITEMS[1][correctIndex]}`); // Log correct answer value & its index for diag
            const promptQuestion = `Current Points: ${this.points} \n Question ${this.counter}: ${question} \n 1) ${answ1} \n 2) ${answ2} \n 3) ${answ3} \n 4) ${answ4}`;
            this.TriviaSend(promptQuestion, () => {
                var thisResponse = () => {
                    setTimeout(() => {
                        this.bot.once("messageCreate", (response) => {
                            if (response.author.id !== this.bot.user.id) {
                                if (response.author.id === this.userID && response.channelId === this.channelID) {
                                    l("Message was from same user and channel");
                                    const userAnswer = response.content;
                                    //l(`User's response: ${userAnswer} VS Correct answer: ${correct}`);
                                    if (userAnswer == correct) {
                                        l(`User answered correct! (${SHUFFLEDITEMS[1][correctIndex]})`);
                                        this.NextQuestion(true);
                                    } else if (userAnswer == wrong1 || userAnswer == wrong2 || userAnswer == wrong3) {
                                        //l(`User answered INCORRECT! (${SHUFFLEDITEMS[1][correctIndex]})`);
                                        this.NextQuestion(false);
                                    } else {
                                        l("The user's response was not an available answer.");
                                        if (this.ListenForCommand() !== true) {
                                            l("Listened for command at line 355.")
                                            thisResponse();
                                        }
                                    }
                                } else {
                                    l("Author/User ID does not match; & channelID does not match.");
                                    if (this.ListenForCommand() !== true) {
                                        l("Listened for command at line 362.")
                                        this.ListenForCommand()
                                    }
                                }
                            }
                        });
                    }, 500);
                }
                if (this.ListenForCommand() !== true) {
                    l("Listened for command at line 371.")
                    thisResponse();
                }
            });
        });
    }

    RemoveNonAlpha(str) {
        let string = str.toString();
        return string.replace(/[^A-Za-z0-9]/g, "");
    }

    ListenForCommand() {
        const listen = new Message();
        var isTrue = listen.OnMessage();
        return isTrue;
    }

    FetchQuestions(__callback) {
        const QUERY = `SELECT * FROM questions WHERE difficulty LIKE UPPER('%${this.difficulty}%') AND type LIKE UPPER('%${this.type}%') AND category LIKE UPPER('%${this.category}%') ORDER BY RAND() LIMIT 1;`;
        this.database.runQuery(QUERY, (result) => {
            const q = result[0];
            const _question = q.question;
            const correct = q.correct;
            const wrong1 = q.answ1;
            const wrong2 = q.answ2;
            const wrong3 = q.answ3;
            const array = [_question, correct, wrong1, wrong2, wrong3];
            __callback(array);
        });
    }

    ShuffleQuestion(unsortedQuestionArray) {
        // Randomizes answers from question, grabs correct & indexes it
        const uQA = unsortedQuestionArray;
        // Grab the question from the array & move answers to separate array:
        const question = uQA[0];
        const correct = uQA[1];
        const wrong1 = uQA[2];
        const wrong2 = uQA[3];
        const wrong3 = uQA[4];
        const answers = this.ArrayShuffle([correct, wrong1, wrong2, wrong3]); // Puts answers in their own array, and shuffles them
        const correctIndex = this.GetIndex(answers, correct);
        const wrong1Index = this.GetIndex(answers, wrong1);
        const wrong2Index = this.GetIndex(answers, wrong2);
        const wrong3Index = this.GetIndex(answers, wrong3);
        /* The following is current index placement for each item in returned array:
        0: Question (value)
        1: Array of shuffled answers (array)
        2: Index of correct answer inside "answers" array
        3: Index of wrong1 answer inside "answers" array
        4: Index of wrong2 answer inside "answers" array
        5: Index of wrong3 answer inside "answers" array
        */
       return [question, answers, correctIndex, wrong1Index, wrong2Index, wrong3Index];
    }

    ArrayShuffle(array) {
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

    GetIndex(array, valueToIndex) {
        const index = array.indexOf(valueToIndex);
        return index;
    }
}

class DB {
    // Properties
    conn;

    constructor(host, user, password, database) {
        const sql = require("mysql");
        this.conn = sql.createConnection({
            host: host,
            user: user,
            password: password,
            database: database
        });
    }

    // Methods
    runQuery(QUERY, __callback) {
        this.conn.query(QUERY, (error, result) => {
            if (error) throw error;
            __callback(result);
        });
    }
}















// Exports
module.exports = {
    l: l,
    Message: Message
};
