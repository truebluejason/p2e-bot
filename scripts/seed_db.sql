# Create Tables
CREATE TABLE Users (
  UserID VARCHAR(128) UNIQUE NOT NULL,
  State VARCHAR(128) NOT NULL,
  Name VARCHAR(128),
  Timezone INT, # -12 to 12
  PRIMARY KEY (UserID)
);
CREATE TABLE UserTimes (
  UserID VARCHAR(128) NOT NULL, 
  Stamp TIME, # HH:MM:SS AKA User's Time
  AdjustedStamp TIME, # HH:MM:SS AKA Server's Time
  FOREIGN KEY (UserID) References Users(UserID)
);
CREATE TABLE Contents (
  ContentID INT AUTO_INCREMENT UNIQUE NOT NULL, 
  Type ENUM('Image','Link','Quote') NOT NULL, 
  Author VARCHAR(128),
  Content VARCHAR(256) UNIQUE NOT NULL,
  Priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  PRIMARY KEY (ContentID)
);
CREATE TABLE Entries (
  UserID VARCHAR(128) NOT NULL, 
  EntryDate DATE NOT NULL, # YYYY-MM-DD
  ContentID INT NOT NULL, 
  DoneStatus ENUM('Done','NotDone') NOT NULL, 
  Area VARCHAR(128), 
  Plan VARCHAR(256), 
  Remedy VARCHAR(256),
  FOREIGN KEY (UserID) References Users(UserID),
  FOREIGN KEY (ContentID) References Contents(ContentID)
);
CREATE TABLE CurrentEntries (
  UserID VARCHAR(128) UNIQUE NOT NULL, 
  EntryDate DATE NOT NULL, # YYYY-MM-DD
  ContentID INT NOT NULL, 
  DoneStatus ENUM('Done','NotDone') NOT NULL, 
  Area VARCHAR(128), 
  Plan VARCHAR(256), 
  Remedy VARCHAR(256),
  FOREIGN KEY (UserID) References Users(UserID),
  FOREIGN KEY (ContentID) References Contents(ContentID)
);

# Create Indexes
CREATE INDEX UserIDX ON Users(UserID);
CREATE INDEX StampIDX ON UserTimes(AdjustedStamp);
CREATE INDEX ContentIDX ON Contents(ContentID);
CREATE INDEX EntryIDX ON Entries(UserID);
CREATE INDEX CurrentEntryIDX ON CurrentEntries(UserID);

# Create Constraints
ALTER TABLE UserTimes ADD CONSTRAINT UserId_Stamp UNIQUE(UserID, Stamp);

# Create Test User
INSERT INTO Users(UserID, State) VALUES ('111', 'Default');
INSERT INTO UserTimes(UserID, Stamp, AdjustedStamp) VALUES ('111', '08:00:00', 3);
INSERT INTO Contents(Type, Author, Content) VALUES ('Quote', 'Buddha', 'The mind is everything. What you think you become.');
INSERT INTO Contents(Type, Author, Content) VALUES ('Quote', 'Dogen', 'If you cannot find the truth right where you are, where else do you expect to find it?');
INSERT INTO Contents(Type, Author, Content) VALUES ('Quote', 'Taisen Deshimaru', 'If you are not happy here and now, you never will be.');
INSERT INTO Entries(UserID, ContentID, EntryDate, DoneStatus) VALUES ('111', 1, '2018-07-04', 'NotDone');
INSERT INTO CurrentEntries(UserID, ContentID, EntryDate, DoneStatus) VALUES ('111', 2, '2018-07-04', 'NotDone');

