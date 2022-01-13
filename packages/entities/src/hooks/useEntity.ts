import { useReducer, useMemo, useCallback } from 'react';

const $dispatch = Symbol('dispatch');

interface EntityConstructor<Entity> {
  new (...args: any[]): Entity;
}

interface EntityInfo<Entity> {
  entityClass: EntityConstructor<Entity>;
  initialArgs: any[];
}

export type EntityUpdater = <Entity>(values: Partial<Entity> | null) => void;

export function deepFreeze(object: object): void {
  Object.keys(object).forEach((key) => {
    const attr = object[key];
    typeof attr === 'object' &&
      attr !== null &&
      !Object.isFrozen(attr) &&
      deepFreeze(attr);
  });
  if (!Object.isFrozen(object)) {
    Object.freeze(object);
  }
}

export function makeEntity<Entity extends Object>({
  entityClass,
  initialArgs,
}: EntityInfo<Entity>): Entity {
  const master = new entityClass(...initialArgs);
  deepFreeze(master);
  const newEntity = Object.create(master);
  return newEntity;
}

export function entityReducer<Entity extends Object>(
  entity: Entity,
  changes: Partial<Entity> | null
): Entity {
  if (changes === undefined) {
    throw new TypeError(
      'Entity updater function cannot take an undefined value as a parameter'
    );
  }
  const master = Object.getPrototypeOf(entity);
  const updatedEntity = Object.create(null);
  if (changes !== null) {
    const correctChanges = Object.entries(changes).filter(
      ([key]) => key in master
    );
    if (correctChanges.length === 0) {
      return entity;
    }
    Object.assign(updatedEntity, entity, Object.fromEntries(correctChanges));
  }
  Object.setPrototypeOf(updatedEntity, master);
  return updatedEntity;
}

export function useEntity<Entity extends Object>(
  entityClass: EntityConstructor<Entity>,
  ...initialArgs: any[]
): [Readonly<Entity>, EntityUpdater] {
  const entityInfo = useMemo(
    () => ({
      entityClass,
      initialArgs,
    }),
    [entityClass.name, ...initialArgs]
  );
  const [entity, dispatch] = useReducer<
    (prevState: any, action: any) => any,
    EntityInfo<Entity>
  >(entityReducer, entityInfo, makeEntity);
  if (!($dispatch in entity)) {
    entity[$dispatch] = dispatch;
  }
  deepFreeze(entity);
  const updater = useUpdater(entity);
  return [entity as Readonly<Entity>, updater];
}

export function useUpdater<Entity extends Object>(
  entity: Readonly<Entity>,
  restrictedKeys: string[] = []
): EntityUpdater {
  return useCallback(
    (values) => {
      if (restrictedKeys.length === 0 || values === null) {
        entity[$dispatch](values);
        return;
      }
      const restrictedValues = restrictedKeys.reduce(
        (result, key) => (key in values && (result[key] = values[key]), result),
        {}
      );
      entity[$dispatch](restrictedValues);
    },
    [entity]
  );
}

export function useCommitter<Entity extends Object>(
  entity: Readonly<Entity>
): () => void {
  return useCallback(() => {
    const oldMaster = Object.getPrototypeOf(entity);
    const masterProto = Object.getPrototypeOf(oldMaster);
    const newMaster = Object.create(masterProto);
    Object.assign(newMaster, entity, oldMaster);
    deepFreeze(newMaster);
    Object.setPrototypeOf(entity, newMaster);
    entity[$dispatch](null);
  }, [entity]);
}
