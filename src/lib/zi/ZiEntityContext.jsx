"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ZiEntityContext = createContext({
  entity: null,
  setEntity: () => {},
});

function normalizeEntity(entity) {
  if (!entity?.type || !entity?.id) return null;

  return {
    type: entity.type,
    id: String(entity.id),
  };
}

export function ZiEntityContextProvider({ children }) {
  const [entity, setEntityState] = useState(null);
  const setEntity = useCallback((nextEntity) => {
    setEntityState(normalizeEntity(nextEntity));
  }, []);

  const value = useMemo(
    () => ({
      entity,
      setEntity,
    }),
    [entity, setEntity]
  );

  return (
    <ZiEntityContext.Provider value={value}>
      {children}
    </ZiEntityContext.Provider>
  );
}

export function useZiEntityContext() {
  return useContext(ZiEntityContext);
}

export function useRegisterZiEntity(entity) {
  const { setEntity } = useZiEntityContext();
  const entityType = entity?.type || null;
  const entityId = entity?.id ? String(entity.id) : null;

  useEffect(() => {
    if (!entityType || !entityId) {
      setEntity(null);
      return undefined;
    }

    setEntity({ type: entityType, id: entityId });
    return () => setEntity(null);
  }, [entityId, entityType, setEntity]);
}
