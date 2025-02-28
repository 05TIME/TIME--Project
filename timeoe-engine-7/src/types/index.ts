export type TimeStampedData = {
    timestamp: Date;
    data: any;
};

export type Event = {
    id: string;
    type: string;
    payload: any;
};

export type CausalRelation = {
    cause: Event;
    effect: Event;
    strength: number;
};

export type Variables = {
    [key: string]: any;
};

export type SimulationResult = {
    originalState: any;
    forkedState: any;
    outcome: any;
};

export type State = {
    [key: string]: any;
};

export type ForkedState = {
    [key: string]: any;
};

export type FilteredData = {
    [key: string]: any;
};