import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FRUIT_TYPES,
  WANTED_SIZES,
  WANTED_SORTS,
  WANTED_STATUSES,
  type FruitType,
  type WantedSize,
  type WantedSort,
  type WantedStatus,
} from './types';

export interface WantedParams {
  page: number;
  size: WantedSize;
  sort: WantedSort;
  status: WantedStatus | '';
  crewId: string;
  fruit: FruitType | '';
  q: string;
}

export const WANTED_DEFAULTS: WantedParams = {
  page: 0,
  size: 20,
  sort: 'bounty,desc',
  status: '',
  crewId: '',
  fruit: '',
  q: '',
};

const Q_MAX = 100;
const CREW_ID_MAX = 200;

function oneOf<T extends string | number>(allowed: readonly T[], value: unknown): T | undefined {
  return allowed.find((a) => a === value);
}

/** Lee la URL y corrige cualquier valor inválido con su default: la vista nunca se rompe. */
function parse(sp: URLSearchParams): WantedParams {
  const page = Number(sp.get('page') ?? '0');
  const crewId = (sp.get('crewId') ?? '').trim();

  return {
    page: Number.isInteger(page) && page >= 0 ? page : WANTED_DEFAULTS.page,
    size: oneOf(WANTED_SIZES, Number(sp.get('size'))) ?? WANTED_DEFAULTS.size,
    sort: oneOf(WANTED_SORTS, sp.get('sort')) ?? WANTED_DEFAULTS.sort,
    status: oneOf(WANTED_STATUSES, sp.get('status')) ?? '',
    fruit: oneOf(FRUIT_TYPES, sp.get('fruit')) ?? '',
    crewId: crewId.length <= CREW_ID_MAX ? crewId : '',
    q: (sp.get('q') ?? '').trim().slice(0, Q_MAX),
  };
}

function serialize(params: WantedParams): URLSearchParams {
  const sp = new URLSearchParams();
  (Object.keys(params) as (keyof WantedParams)[]).forEach((key) => {
    if (params[key] !== WANTED_DEFAULTS[key]) sp.set(key, String(params[key]));
  });
  return sp;
}

/**
 * La URL es la única fuente de verdad del listado.
 * Cualquier cambio que no sea solo de página vuelve a la página 0.
 */
export function useWantedParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parse(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<WantedParams>, options?: { replace?: boolean }) => {
      setSearchParams(
        (prev) => {
          const current = parse(prev);
          const next: WantedParams = { ...current, ...patch };
          const onlyPage = Object.keys(patch).every((key) => key === 'page');
          if (!onlyPage) next.page = 0;
          return serialize(next);
        },
        { replace: options?.replace },
      );
    },
    [setSearchParams],
  );

  return { params, update };
}
