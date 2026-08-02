import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ErrorResponse, HealthStatus, Lesson, LessonInput, LessonUpdate, ProgressSummary, Unit, UnitInput, UnitUpdate, UnitWithLessons } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListUnitsUrl: () => string;
/**
 * Returns all units with their lessons and progress
 * @summary List all units
 */
export declare const listUnits: (options?: Parameters<typeof customFetch>[1]) => Promise<UnitWithLessons[]>;
export declare const getListUnitsQueryKey: () => readonly ["/api/units"];
export declare const getListUnitsQueryOptions: <TData = Awaited<ReturnType<typeof listUnits>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUnits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUnits>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUnitsQueryResult = NonNullable<Awaited<ReturnType<typeof listUnits>>>;
export type ListUnitsQueryError = ErrorType<unknown>;
/**
 * @summary List all units
 */
export declare function useListUnits<TData = Awaited<ReturnType<typeof listUnits>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUnits>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateUnitUrl: () => string;
/**
 * @summary Create a unit
 */
export declare const createUnit: (unitInput: UnitInput, options?: Parameters<typeof customFetch>[1]) => Promise<Unit>;
export declare const getCreateUnitMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUnit>>, TError, {
        data: BodyType<UnitInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createUnit>>, TError, {
    data: BodyType<UnitInput>;
}, TContext>;
export type CreateUnitMutationResult = NonNullable<Awaited<ReturnType<typeof createUnit>>>;
export type CreateUnitMutationBody = BodyType<UnitInput>;
export type CreateUnitMutationError = ErrorType<unknown>;
/**
* @summary Create a unit
*/
export declare const useCreateUnit: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createUnit>>, TError, {
        data: BodyType<UnitInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createUnit>>, TError, {
    data: BodyType<UnitInput>;
}, TContext>;
export declare const getGetUnitUrl: (id: number) => string;
/**
 * @summary Get a unit with its lessons
 */
export declare const getUnit: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<UnitWithLessons>;
export declare const getGetUnitQueryKey: (id: number) => readonly [`/api/units/${number}`];
export declare const getGetUnitQueryOptions: <TData = Awaited<ReturnType<typeof getUnit>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUnit>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUnit>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUnitQueryResult = NonNullable<Awaited<ReturnType<typeof getUnit>>>;
export type GetUnitQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a unit with its lessons
 */
export declare function useGetUnit<TData = Awaited<ReturnType<typeof getUnit>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUnit>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUnitUrl: (id: number) => string;
/**
 * @summary Update a unit
 */
export declare const updateUnit: (id: number, unitUpdate: UnitUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Unit>;
export declare const getUpdateUnitMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUnit>>, TError, {
        id: number;
        data: BodyType<UnitUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUnit>>, TError, {
    id: number;
    data: BodyType<UnitUpdate>;
}, TContext>;
export type UpdateUnitMutationResult = NonNullable<Awaited<ReturnType<typeof updateUnit>>>;
export type UpdateUnitMutationBody = BodyType<UnitUpdate>;
export type UpdateUnitMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update a unit
*/
export declare const useUpdateUnit: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUnit>>, TError, {
        id: number;
        data: BodyType<UnitUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUnit>>, TError, {
    id: number;
    data: BodyType<UnitUpdate>;
}, TContext>;
export declare const getDeleteUnitUrl: (id: number) => string;
/**
 * @summary Delete a unit
 */
export declare const deleteUnit: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteUnitMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUnit>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteUnit>>, TError, {
    id: number;
}, TContext>;
export type DeleteUnitMutationResult = NonNullable<Awaited<ReturnType<typeof deleteUnit>>>;
export type DeleteUnitMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete a unit
*/
export declare const useDeleteUnit: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteUnit>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteUnit>>, TError, {
    id: number;
}, TContext>;
export declare const getListLessonsUrl: () => string;
/**
 * @summary List all lessons
 */
export declare const listLessons: (options?: Parameters<typeof customFetch>[1]) => Promise<Lesson[]>;
export declare const getListLessonsQueryKey: () => readonly ["/api/lessons"];
export declare const getListLessonsQueryOptions: <TData = Awaited<ReturnType<typeof listLessons>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLessons>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listLessons>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListLessonsQueryResult = NonNullable<Awaited<ReturnType<typeof listLessons>>>;
export type ListLessonsQueryError = ErrorType<unknown>;
/**
 * @summary List all lessons
 */
export declare function useListLessons<TData = Awaited<ReturnType<typeof listLessons>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listLessons>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateLessonUrl: () => string;
/**
 * @summary Create a lesson
 */
export declare const createLesson: (lessonInput: LessonInput, options?: Parameters<typeof customFetch>[1]) => Promise<Lesson>;
export declare const getCreateLessonMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createLesson>>, TError, {
        data: BodyType<LessonInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createLesson>>, TError, {
    data: BodyType<LessonInput>;
}, TContext>;
export type CreateLessonMutationResult = NonNullable<Awaited<ReturnType<typeof createLesson>>>;
export type CreateLessonMutationBody = BodyType<LessonInput>;
export type CreateLessonMutationError = ErrorType<unknown>;
/**
* @summary Create a lesson
*/
export declare const useCreateLesson: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createLesson>>, TError, {
        data: BodyType<LessonInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createLesson>>, TError, {
    data: BodyType<LessonInput>;
}, TContext>;
export declare const getGetLessonUrl: (id: number) => string;
/**
 * @summary Get a lesson
 */
export declare const getLesson: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<Lesson>;
export declare const getGetLessonQueryKey: (id: number) => readonly [`/api/lessons/${number}`];
export declare const getGetLessonQueryOptions: <TData = Awaited<ReturnType<typeof getLesson>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLesson>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLesson>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLessonQueryResult = NonNullable<Awaited<ReturnType<typeof getLesson>>>;
export type GetLessonQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get a lesson
 */
export declare function useGetLesson<TData = Awaited<ReturnType<typeof getLesson>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLesson>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateLessonUrl: (id: number) => string;
/**
 * @summary Update a lesson (including status)
 */
export declare const updateLesson: (id: number, lessonUpdate: LessonUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Lesson>;
export declare const getUpdateLessonMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateLesson>>, TError, {
        id: number;
        data: BodyType<LessonUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateLesson>>, TError, {
    id: number;
    data: BodyType<LessonUpdate>;
}, TContext>;
export type UpdateLessonMutationResult = NonNullable<Awaited<ReturnType<typeof updateLesson>>>;
export type UpdateLessonMutationBody = BodyType<LessonUpdate>;
export type UpdateLessonMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update a lesson (including status)
*/
export declare const useUpdateLesson: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateLesson>>, TError, {
        id: number;
        data: BodyType<LessonUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateLesson>>, TError, {
    id: number;
    data: BodyType<LessonUpdate>;
}, TContext>;
export declare const getDeleteLessonUrl: (id: number) => string;
/**
 * @summary Delete a lesson
 */
export declare const deleteLesson: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteLessonMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteLesson>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteLesson>>, TError, {
    id: number;
}, TContext>;
export type DeleteLessonMutationResult = NonNullable<Awaited<ReturnType<typeof deleteLesson>>>;
export type DeleteLessonMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete a lesson
*/
export declare const useDeleteLesson: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteLesson>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteLesson>>, TError, {
    id: number;
}, TContext>;
export declare const getGetProgressSummaryUrl: () => string;
/**
 * Returns overall completion statistics and current progress
 * @summary Get overall progress summary
 */
export declare const getProgressSummary: (options?: Parameters<typeof customFetch>[1]) => Promise<ProgressSummary>;
export declare const getGetProgressSummaryQueryKey: () => readonly ["/api/progress/summary"];
export declare const getGetProgressSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getProgressSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProgressSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProgressSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProgressSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getProgressSummary>>>;
export type GetProgressSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get overall progress summary
 */
export declare function useGetProgressSummary<TData = Awaited<ReturnType<typeof getProgressSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProgressSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map