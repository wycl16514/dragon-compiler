I want to make your hand wetted first. This is a toy project which contains a simple language intepreter and its debugging IDE all are developed by using reactjs. Please clone the project to your local directory, and cd into the directory by your console and run:
```
npm i
```
to install all dependencies. After that you can run 
```
npm start 
```
to bright up the project, and you will see something like this:
<img width="683" alt="截屏2024-01-10 17 12 58" src="https://github.com/wycl16514/dragon-compiler/assets/7506958/962a6a4b-90dc-4346-9dbe-e80954b59d58">

please add following code into the editer:
```js
let add=fn(x){
    if(x>0){
        return 1+add(x-1);
    }else{
        return 0;
    }
};
let z=add(3);
```
this is what you will see after your typing:

<img width="610" alt="截屏2024-01-10 17 17 10" src="https://github.com/wycl16514/dragon-compiler/assets/7506958/0407f557-8d5f-4105-9ce0-ca9314431296">
you can see there are line numbers along the code in the left, please hit the button "parsing" and then hit "step", and you will see the following:
<img width="333" alt="截屏2024-01-10 17 20 37" src="https://github.com/wycl16514/dragon-compiler/assets/7506958/ab161659-510b-4b74-a71b-d6192324408d">
you can see one line of code is hightlined with yellow background which means the current line of code is executing by the intepreter. continue clicking the "step" button, it will setp into the function, and you move your cursor over the variable with name "x" and you can see following:
<img width="445" alt="截屏2024-01-10 17 23 40" src="https://github.com/wycl16514/dragon-compiler/assets/7506958/1713b40a-c39b-49df-8949-647dc9bd9f40">
there is a popup which contains the value for variable x, please continue to hit step and the you will step into the function again and move your mouse over the variable x again, this time you will see its value turns into 2 in the popup.

please try and play around the app, click "step" more times and you will find more and very likely you will find it ..... crashed.

yes, its just a toy project which let you feel what we will achived in this course and make sure this is what your want, we will redo and redesign. We want to achive following goals:
1, design a new programming language ,it will look like javascript alot, let's call it dragon-script.
2, we will design an intepreter to parse and execute the code
3, we will design an IDE to run and debug the code.

yes, this course will teach your how to create a compiler or intepreter for a given programming language, we will create our intepreter and IDE by using js and react, please play around and make sure this is what you want, it would be my biggest crime if I wasting your time, if you are sure this is what you want then we will get along with each other for a certain time and do someting quit funny and a little bit chanllange.

I very wish to see you at next video. you can download the whole project without using "npm i" from following link:
https://drive.google.com/file/d/1J2EB_44oOhnfZolGf97ynz6IPji6SVw-/view?usp=sharing
