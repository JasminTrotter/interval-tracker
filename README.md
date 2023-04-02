# interval-tracker
A tiny app for tracking interval times

## Why I built it:
This is seriously a tiny, lowkey web app I just slapped together in a few hours over the weekend. Don't expect much. The reason I created it is I needed a way to track a physical symptom I've been having so I can have insight into its rate of occurance. I built it with HTML, CSS, and vanilla JS.

### How it works
Click "Add Time" button to add the current time. The "Notes" field is optional. You can also optionally set a "Custom Time" if you want to track an occurance that happened prior to the current time. If you do enter a custom time, make sure that is is not a time that is prior to the most recently entered time, otherwise it will break the interval length calculation.

The last entered time can be deleted by clicking "Delete Latest Time," and if you clicked it by mistake you can click "Recover Last Deleted Row" (but you can only do it once because the application only saves memory of one last deleted row)

### Data Storage:
The application utilizes local storage to persist the interval data. So, the app is best used on only one device in one browser for accurate tracking (data will not persist across devices/browsers). I intend to use the app on my phone since it is most easily accessible while symptoms occur multiple times per day. 
