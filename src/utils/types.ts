export interface CopterData {
    addr: string;
    name: string;
    battery?: number | null;
    flight_mode: string;
    state: "OPRN" | "BUSY" | "CRIT" | "WARN";
    status: string;
    x: number;
    y: number;
    z: number;
    color: number[];
}

export interface Query {
    method_name: string;
    args?: any;
}

export interface Response {
    id: number;
    result: {
        result: boolean;
        details: string;
        payload?: unknown
    };
}

