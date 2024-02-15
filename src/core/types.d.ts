// simple hacks for Class types
export type Class = new () => object;
export type Instance = InstanceType<Class>;
