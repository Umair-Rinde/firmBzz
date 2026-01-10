import {
  DefaultError,
  DefinedInitialDataOptions,
  Query,
  QueryClient,
  QueryKey,
  useQuery as RQuseQuery,
  UndefinedInitialDataOptions,
  UseQueryOptions,
  UseQueryResult,
  useQueries,
} from "@tanstack/react-query";
import { axios } from "@/config/axios";

function fetchData<TQueryFnData = any>(
  url: any,
  params?: { [key: string]: any }
): Promise<TQueryFnData> {
  return axios.get(url, {
    params,
  });
}

type QueryOptionType<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> =
  | (DefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
      onError?: (
        error: DefaultError,
        query: Query<unknown, unknown, unknown>
      ) => void;
    })
  | (UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
      onSuccess?: (
        data: TQueryFnData,
        query: Query<unknown, unknown, unknown>
      ) => void;
    })
  | (UndefinedInitialDataOptions<TQueryFnData, TError, TData, TQueryKey> & {
      onSettled?: (
        data: TQueryFnData | undefined,
        error: DefaultError | null,
        query: Query<unknown, unknown, unknown>
      ) => void;
    });

export function useQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options:
    | QueryOptionType<TQueryFnData, TError, TData, TQueryKey>
    | Array<QueryOptionType<TQueryFnData, TError, TData, TQueryKey>>,
  queryClient?: QueryClient
): UseQueryResult<TData, TError> {
  if (Array.isArray(options)) {
    //eslint-disable-next-line
    return useQueries({
      queries: options.map((item) => ({
        ...item,
        queryKey: item.queryKey,
        queryFn: () =>
          fetchData<TQueryFnData>(
            item.queryKey[0],
            typeof item.queryKey[1] === "object" ? item.queryKey[1] || {} : {}
          ),
      })),
    });
  }

  return RQuseQuery(
    {
      ...options,
      queryFn: () =>
        fetchData<TQueryFnData>(
          options.queryKey[0],
          typeof options.queryKey[1] === "object"
            ? options.queryKey[1] || {}
            : {}
        ),
    },
    queryClient
  );
}
