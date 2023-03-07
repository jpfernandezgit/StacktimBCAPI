using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Localization;
using System.Globalization;
using System.Reflection;
using StacktimBCAPI.Model;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//Swagger
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();       // Log console kestrel
builder.Logging.AddDebug();         // Log fen�tre de debug VS22
//builder.Logging.AddEventLog();    // Log  Windows

//Localisation
builder.Services.AddLocalization(options => options.ResourcesPath = "Ressources"); // Pour la localisation des messages. C'est le nom du dossier contenat les fichiers . resx
builder.Services.AddRequestLocalization(options =>
   {
       var oCultures = new List<CultureInfo> { new CultureInfo("en"), new CultureInfo("fr") };
       options.DefaultRequestCulture = new RequestCulture(culture: "fr", uiCulture: "fr");
       options.SupportedCultures = oCultures;
       options.SupportedUICultures = oCultures;
   });

// D�marrage
var app = builder.Build();

// Configuration du pipeline HTTP
if (app.Environment.IsDevelopment()) // Test la variable d'environnement ASPNETCORE_ENVIRONMENT. La variable d'environnement ASPNETCORE_ENVIRONMENT peut �tre indiqu�e au niveau de l'OS, dans launchsettings (pour VS), dans appSesstings.json (si h�b�rgement Kestrel) ou m�me dans le web.config si IIS 
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseDeveloperExceptionPage(); // Affiche la page d'erreur (c'est le d�faut en fait)
}
else app.UseExceptionHandler("/Error"); // Redirge vers une route avec l'erreur 


app.UseRequestLocalization(); // Pour la localisation, le use est n�c�ssaire (pas que le Add)

app.MapGet("/", (IStringLocalizerFactory _localizerFactory, IHostEnvironment _environment) =>
{

    //throw new SystemException("Il n'y a pas de route par d�faut dans l'API. Merci d'indiquer une route");
    var oLocalizer = _localizerFactory.Create("StackTimBC", _environment.ApplicationName); // Le premier param�tre est le nom des ficheirs de ressource
    var cMessage = oLocalizer["NoDefaultRoute"].ToString();
    return Results.BadRequest(new { Error = cMessage });

});

app.MapGet("Error", (HttpContext _context, ILoggerFactory _loggerFactory, IConfiguration _configuration, IStringLocalizerFactory _localizerFactory, IHostEnvironment _environment) =>
{
    // Por passer un logger en DI � une lambda en Minimal API il faut utiliser ILoggerFactory 
    // En effet on ne peut paas injecter directement iLogguer car il demande un type dans le constructueur ILogger<T>. Ce qui exigerai de cr��r une classe pour g�rer les log
    // Ici on peut �v�ntuellement loguer les erreurs dans un fichier

    // Pr�ambule : localisation du message d'erreur
    // var oCourrentLanguage = _context.Features.Get<IRequestCultureFeature>();                                            // Moyen de r�cup�rer la labgue en cours, mais pas besoin ici 
    // var cLangue =  (oCourrentLanguage != null) ? oCourrentLanguage.RequestCulture.Culture.ToString() ?? "fr" : "fr";   // Moyen de r�cup�rer la labgue en cours, mais pas besoin ici

    // var cAssemblyName = new AssemblyName(Assembly.GetExecutingAssembly().FullName ?? "").Name; // C'est plus simple d'utiliser l'environnement de l'application et l'injkecter

    var oLocalizer = _localizerFactory.Create("StackTimBC", _environment.ApplicationName); // Le premier param�tre est le nom des ficheirs de ressource
    var cMessage = oLocalizer["Error"].ToString();


    var oExceptionHandlerFeature = _context.Features.Get<IExceptionHandlerFeature>();

    // Affiche le'erreur dans le logueur configur� au d�but de l'application (console normalement)
    var oLogger = _loggerFactory.CreateLogger("Error_StackTimBC");
    oLogger.LogError(oExceptionHandlerFeature!.Error.Message, oExceptionHandlerFeature!.Error.StackTrace);

    // Sauvegarde de l'erreur sur disque
    var oErreurID = Guid.NewGuid();
    File.AppendAllText(_configuration["LOGFILE"]!, "================ " + DateTime.Now.ToString() + " ID " + oErreurID.ToString() + Environment.NewLine
                                                                       + oExceptionHandlerFeature!.Error.Message + Environment.NewLine
                                                                       + oExceptionHandlerFeature!.Error.StackTrace + Environment.NewLine);


    return Results.Problem($"{cMessage} {oErreurID}");



}

);

app.MapGet("Projets", () =>
{
    return Results.Ok(new Projet()); 
});


app.Run();

