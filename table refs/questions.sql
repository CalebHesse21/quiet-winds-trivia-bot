CREATE TABLE questions (
    qID int(22) PRIMARY KEY AUTO_INCREMENT NOT NULL,
    category varchar(500) NOT NULL,
    type varchar(500) NOT NULL,
    difficulty varchar(500) NOT NULL,
    question text(5000) NOT NULL,
    correct text(5000) NOT NULL,
    answ1 text(5000) NOT NULL,
    answ2 text(5000) NOT NULL,
    answ3 text(5000) NOT NULL
);