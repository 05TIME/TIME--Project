import { WhatIfPlayground } from './components';
import express from 'express';
import { Engine } from '../$TIMEŒ-Engine/src/engine'; // Ensure this path is correct or create the module if it does not exist

const app = express();
const port = process.env.PORT || 3000;

// Initialize the $TIMEŒ Engine
const engine = new Engine();

// Middleware to parse JSON requests
app.use(express.json());

// Define routes
app.get('/api/temporal', (req, res) => {
  // Your route logic here
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export interface UserInput {
    timestamp: string;
    data: Record<string, any>;
}

export interface CausalRelationship {
    cause: string;
    effect: string;
    strength: number;
}

export interface AnalysisResult {
    causalRelationships: CausalRelationship[];
    simulationResults: SimulationResult[];
}

export interface SimulationResult {
    id: string;
    value: number;
}

export interface ComponentProps {
    title: string;
    onClick: () => void;
}