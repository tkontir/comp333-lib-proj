# COMP333 (SWE) Group Project Style Guide

## Comment Style
Block comments will be made at the top of each function, prior to its declaration. These blocks will contain all of the input parameters, including name and type. They will also include a description of the expected output, including types. A brief description of the functions purpose will also be included, with examples possibly being provided if deemed necessary for best understanding. 
```js
/* add (int / float, int / float) => int / float
    This function takes in two numeric values, and returns their sum.
    add (1, 2) = 3 */
function add (a, b) {
    return a + b;
}
```
Inline comments will be added when deemed necessary to explain code or algorithims to teammates and future selves. They will be used sparingly as to not clutter the code base. 

## Variable and Function Naming Conventions
Our naming convention for both variables and functions will be snake case. Our variables will be strictly nouns and at least 3 characters long, unless using an i or j for common iteration. Our functions will be stricly verbs, describing the action they perform. 

## Coupling & Cohesion
Our goal is to create a highly cohesive code base. Each function will have a clearly defined purpose and will be able to interact seemlessly with other functions. Any code that may serve a purpose more than once will be generalized into a useable function, following the DRY principle.

We also want to ensure loose coupling within our project. We will do so by reducing the amount of direct dependancies between components. Additionally, we will minimize the number of global variables used in our code, rather pass relevant information as function parameters when needed. 

## Links
DRY Principle https://www.geeksforgeeks.org/software-engineering/dont-repeat-yourselfdry-in-software-development/

## Branching Norms: 

Before branching, all members of the team will discuss which features they hope to implement to avoid working on the same thing twice. Our naming conventions for these branches will not have very strict naming rules. As long as they are simple are cocise and no longer then 3 words total. It is also acceptable to break these words up with either a - and a _ for clarity's sake. Branches will be pushed to main after discussion with the team and after the team member has checked it for compatibility. If any branch directly affects another feature, the team member will have to communicate with the other team member responsible for that feature to make sure that the entire team is on the same page about what our code is accomplishing.

2025

Tanner Kontir,
Will Rao,
Phone Kant
