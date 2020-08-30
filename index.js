const { ipcRenderer } = require('electron');
var schedule = require('node-schedule');
var shown = true;
var d;            //d is the object for accessing date methods
var hrs=0,mins=0,snoozemins=0;

function time()   //used for getting current time in hrs and minutes
{
    d = new Date();   
    hrs = d.getHours();
    mins = d.getMinutes();
    snoozemins = d.getMinutes();
    if(hrs == 23)       //Basic 24 hrs exceptions
    {
        hrs=0;
    }
    else
    {
        hrs++;          // Increment of hrs
    }
    if(snoozemins == 55) //mins exceptions to revert back to 0-1-2-3 after 55,56,56 etc
    {
        snoozemins=0;
    }
    else if(snoozemins == 56)
    {
        snoozemins=1;
    }
    else if(snoozemins == 57)
    {
        snoozemins=2;
    }
    else if(snoozemins == 58)
    {
        snoozemins=3;
    }
    else if(snoozemins == 59)
    {
        snoozemins=4;
    }
    else
    {
        snoozemins = snoozemins+5;    //5 min increment after snooze
    }
}
function ScheduleNotification()       //after calculating time, scheduling takes place
{
    time();
    //time is there in corresponding variables, schudulejob fucntion takes them as parameters
    var event = schedule.scheduleJob({hour: hrs, minute: mins}, function() {
        if(shown == true)
        {
            ipcRenderer.send("notify");   //sends msg to main process to show notification after time is reached
            shown = false;
            event.cancel();
        }
    });
}
//ScheduleNotification must be called when the window loads/is started
document.addEventListener("DOMContentLoaded", function() {
    ScheduleNotification();
});
//When up button is pressed, the window is hidden, and whole process is started again
document.getElementById("up").addEventListener("click",function(){
    ipcRenderer.send("hide");  //sends msg to main process to hide notification after up is clicked
        shown = true;
        hrs=0;   //varibles are reset
        mins=0;      
        ScheduleNotification();    //by calling this, whole process starts again
})
/*When snooze button is pressed, window is hidden and time is calculated again but only
snoozetime variable is passed in the schedulejob method
This happes every 5 mins if the user keeps pressing snooze button
Whenever he clicks up button, again 1 hour notification is scheduled
*/
document.getElementById("snooze").addEventListener("click",function(){
    ipcRenderer.send("hide");  //sends msg to main process to hide notification after snooze is clicked
    time();  //time calculated again
    var snooze = schedule.scheduleJob({minute:snoozemins}, function() {  //only snoozetime is passed

            ipcRenderer.send("notify");
            snooze.cancel();
})
});

//main process sends the msg to renderer procoess to show the required alert msg
ipcRenderer.on("Second Instance" , (event, arg) => {
    alert("Breaktime Is Already Running\nCheck The Tray Icon For More Details.")
});

ipcRenderer.on("ConfirmExit" , (event, arg) => {
    var exit = confirm("This will close the Breaktime application.\nYou will no longer receive reminders.");
    if (exit==true)
    {
        ipcRenderer.send("Quit");
    }
});