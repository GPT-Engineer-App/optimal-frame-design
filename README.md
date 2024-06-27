# optimal-frame-design

clc 
clear all
close all

model.nodes = [0 0;
    3 0;
    9 0;
    15 0;
    20 0;
    18 2;
    12 2;
    6 2;
    0 2;
    3 4;
    9 4;
    15 4;
    12 6;
    6 6;
    0 6;
    3 8;
    9 8;
    6 10;
    0 10;
    3 11;
    0 13;
    6 12;
    10 13;
    14 14;
    18 15;
    20 18.25;
    18 18;
    14 17.5;
    10 17;
    6 16.5;
    2 16;
    20 0.625];

model.elements = [1 2 1 6;
    4 5 1 6;
    1 9 1 2;
    2 10 1 3;
    3 11 1 2;
    4 12 1 5;
    2 9 1 2;
    2 8 1 2;
    3 8 1 2;
    3 7 1 3;
    4 7 1 4;
    4 6 1 4;
    5 32 1 6;
    6 32 1 6;
    9 10 1 1;
    8 10 1 1;
    8 11 1 1;
    7 11 1 1;
    7 12 1 4;
    6 12 1 4;
    9 15 1 1;
    8 14 1 2;
    7 13 1 2;
    10 15 1 1;
    10 14 1 1;
    11 14 1 1;
    11 13 1 1;
    12 13 1 3;
    10 16 1 3;
    11 17 1 2;
    15 16 1 1;
    14 16 1 3;
    14 17 1 3;
    17 13 1 3;
    15 19 1 3;
    14 18 1 2;
    19 16 1 1;
    16 18 1 3;
    18 17 1 3;
    19 20 1 1;
    20 18 1 1;
    19 21 1 3;
    18 22 1 2;
    21 20 1 1;
    20 22 1 1;
    21 22 1 1;
    22 23 1 3;
    23 24 1 1;
    24 25 1 6;
    25 26 1 6;
    26 27 1 1;
    27 28 1 1;
    28 29 1 3;
    29 30 1 3;
    30 31 1 3;
    31 21 1 3;
    31 22 1 3;
    22 30 1 1;
    22 29 1 3;
    29 23 1 3;
    23 28 1 3;
    28 24 1 1;
    24 27 1 1;
    27 25 1 6;
    16 20 1 1];

R = 0.08; % Initial radius
t = 0.005; % Initial thickness
A = pi * (R^2 - (R-t)^2);

model.materials(1).elasticityModulus = 210 * 10^9;
model.materials(1).yieldStress = 160 * 10^6;
model.materials(1).density = 7800;
model.materials(1).crossSection = (1/2) * A;

% (define other materials similarly)

model.constraints = [ ... % Your constraints data
    1 1;
    1 2;
    2 1;
    2 2;
    3 1;
    3 2;
    4 1;
    4 2;
    5 1;
    5 2];

model.external.loads = [ ... % Your loads data
    6 2 -200*10^3;
    12 2 -200*10^3;
    13 2 -200*10^3;
    17 2 -200*10^3;
    18 2 -200*10^3;
    27 2 -10*10^3;
    28 2 -10*10^3;
    29 2 -10*10^3;
    30 2 -10*10^3;
    31 2 -10*10^3];

model.safetyFactor = 8;

% Check the model
checkModel2D(model);

% Split beam elements into multiple elements
model = splitElements(model, 20);

% Count degrees of Freedom
model = setDOFs(model);

% Create stiffness matrix
model = stiffnessMatrix(model);

% Apply constraints
model = applyConstraints(model);

% Apply external loads
model = applyLoads(model);

% Add element weight to external loads
model = applyWeights(model);

% Solve FEM
model = solveFEM(model);

% Get element forces
model = getElementForces(model);

% Get maximum shear stress per element
model = getElementMaxStress(model);

% Define objective function
objective = @(x) frameWeight(x, model);

% Define nonlinear constraints
nonlincon = @(x) stressAndDisplacementConstraints(x, model);

% Initial guess for optimization variables
x0 = [model.materials.crossSection]';

% Lower and upper bounds for the variables
lb = 0.001 * x0;
ub = 10 * x0;

% Optimization options
options = optimoptions('fmincon', 'Display', 'iter', 'Algorithm', 'sqp');

% Run optimization
[x_opt, fval] = fmincon(objective, x0, [], [], [], [], lb, ub, nonlincon, options);

% Save optimal values
save('optimal_values.mat', 'x_opt', 'fval');

% Plot results
plotDeformations(model);
plotMaxShearStresses(model);

function weight = frameWeight(x, model)
    weight = 0;
    for i = 1:model.nElements
        elementNodes = model.elements(i, 1:2);
        node1 = elementNodes(1);
        node2 = elementNodes(2);
        elementLength = norm(model.nodes(node1, :) - model.nodes(node2, :));
        materialIndex = model.elements(i, 3);
        density = model.materials(materialIndex).density;
        weight = weight + x(materialIndex) * density * elementLength;
    end
end

function [c, ceq] = stressAndDisplacementConstraints(x, model)
    % Update the model with the new cross-sectional areas
    for i = 1:length(model.materials)
        model.materials(i).crossSection = x(i);
    end
    
    % Solve FEM with updated model
    model = solveFEM(model);
    
    % Get maximum shear stress per element
    model = getElementMaxStress(model);
    
    % Calculate constraints
    maxStresses = [model.elements(:).maxStress];
    yieldStresses = [model.materials(:).yieldStress];
    safetyFactor = model.safetyFactor;
    
    c = maxStresses - yieldStresses / safetyFactor;
    ceq = [];
end

## Collaborate with GPT Engineer

This is a [gptengineer.app](https://gptengineer.app)-synced repository 🌟🤖

Changes made via gptengineer.app will be committed to this repo.

If you clone this repo and push changes, you will have them reflected in the GPT Engineer UI.

## Tech stack

This project is built with React with shadcn-ui and Tailwind CSS.

- Vite
- React
- shadcn/ui
- Tailwind CSS

## Setup

```sh
git clone https://github.com/GPT-Engineer-App/optimal-frame-design.git
cd optimal-frame-design
npm i
```

```sh
npm run dev
```

This will run a dev server with auto reloading and an instant preview.

## Requirements

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
