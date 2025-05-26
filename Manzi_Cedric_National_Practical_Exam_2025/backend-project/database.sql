CREATE DATABASE IF NOT EXISTS CWSMS;
USE CWSMS;

CREATE TABLE Package (
    PackageNumber INT AUTO_INCREMENT PRIMARY KEY,
    PackageName VARCHAR(50),
    PackageDescription VARCHAR(100),
    PackagePrice DECIMAL(10,2)
);

CREATE TABLE Car (
    PlateNumber VARCHAR(20) PRIMARY KEY,
    CarType VARCHAR(50),
    CarSize VARCHAR(20),
    DriverName VARCHAR(100),
    PhoneNumber VARCHAR(20)
);

CREATE TABLE ServicePackage (
    RecordNumber INT AUTO_INCREMENT PRIMARY KEY,
    ServiceDate DATE,
    PlateNumber VARCHAR(20),
    PackageNumber INT,
    FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber),
    FOREIGN KEY (PackageNumber) REFERENCES Package(PackageNumber)
);

CREATE TABLE Payment (
    PaymentNumber INT AUTO_INCREMENT PRIMARY KEY,
    AmountPaid DECIMAL(10,2),
    PaymentDate DATE,
    RecordNumber INT,
    FOREIGN KEY (RecordNumber) REFERENCES ServicePackage(RecordNumber)
);

CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE,
    Password VARCHAR(100)
);

-- Insert sample data
INSERT INTO Package (PackageName, PackageDescription, PackagePrice)
VALUES ('Basic wash', 'Exterior hand wash', 5000.00);

-- Insert default user (username: admin, password: admin123)
INSERT INTO User (Username, Password)
VALUES ('admin', 'admin123');
