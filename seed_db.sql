# Create Tables
CREATE TABLE Users (
  UserID VARCHAR(128) UNIQUE NOT NULL,
  State VARCHAR(128) NOT NULL,
  Name VARCHAR(128),
  PRIMARY KEY (UserID)
);
CREATE TABLE Contents (
  ContentID INT AUTO_INCREMENT UNIQUE NOT NULL, 
  Type ENUM('Image','Link','Quote') NOT NULL, 
  Content VARCHAR(256) NOT NULL,
  Priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  PRIMARY KEY (ContentID)
);
CREATE TABLE Times (
  UserID VARCHAR(128) NOT NULL, 
  Stamp TIME,
  FOREIGN KEY (UserID) References Users(UserID)
);
CREATE TABLE Entries (
  UserID VARCHAR(128) NOT NULL, 
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
CREATE INDEX ContentIDX ON Contents(ContentID);
CREATE INDEX StampIDX ON Times(Stamp);
CREATE INDEX EntryIDX ON Entries(UserID);
CREATE INDEX CurrentEntryIDX ON CurrentEntries(UserID);

# Create Test User
INSERT INTO Users(UserID, State) VALUES ('111', 'Default');
