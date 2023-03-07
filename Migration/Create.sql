-- Création de la base

Create database StackTimBC

use StackTimBC
GO

-- Tables 

Create Table Categories (
IdCategorie int not null identity(1,1) primary key,
Descriptif varchar(50),
)

Create Table Connaissances (
IdConnaissance int not null identity(1,1) primary key,
Nom varchar(50),
DescriptifCourt varchar(500),
DescriptifLong varchar(Max),
IDCategorie int Foreign key references Categories(IdCategorie) On Delete Set Null On Update Cascade
)

Create Table TypesRessources  (
IdTypeRessource int not null identity(1,1) primary key,
Descriptif  varchar(Max),
Image       varchar(Max),
)

Create Table Ressources  (
IdRessource int not null identity(1,1) primary key,
DatePublication Datetime2,
CreePar  varchar(50),
Contenu varchar(max),
IdTypeRessource int Foreign Key references TypesRessources(IdTypeRessource) On Delete Set Null On Update Cascade
)

Create Table Projets  (
IdProjet int not null identity(1,1) primary key,
DateCreation Datetime2,
Etat varchar(20),
CreePar  varchar(50),
Contenu varchar(max),
)


Create Table ConnaissancesProjets  (
IdConnsancesProjets int not null identity(1,1) primary key,
IdConnaissance int Foreign key references Connaissances(IdConnaissance) On Delete Cascade On Update Cascade,
IdProjet int Foreign key references Projets(IdProjet) On Delete Cascade On Update Cascade
)




