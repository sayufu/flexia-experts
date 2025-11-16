import {FlexiaIcon} from "@/assets/FlexiaIcon.tsx";
import {Button} from "@/components/ui/button.tsx";
import {BiLogOut} from "react-icons/bi";
import {Input} from "@/components/ui/input.tsx";
import {ExercisesTable} from "@/exercises/components/ExercisesTable.tsx";
import {ExercisesTableFiltersDrawer} from "@/exercises/components/ExercisesTableFiltersDrawer.tsx";
import {useEffect, useState} from "react";
import {CreateEditExerciseDrawer} from "@/exercises/components/CreateEditExerciseDrawer.tsx";
import {toast} from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {filterExercisesByProps, searchExercisesByName} from "@/api/exercises/exercisesApi.ts";
import type {Exercise, SearchExercisesResponse} from "@/exercises/types/exercise.ts";
import type {RootState} from "@/store";
import {clearFilters} from "@/store/filtersSlice.ts";

export const ExercisesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [openFilters, setOpenFilters] = useState(false);
  const [openFormDrawer, setOpenFormDrawer] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const limit = pageSize;

  const muscleGroup = useSelector((state: RootState) => state.filters.muscleGroup);
  const difficulty = useSelector((state: RootState) => state.filters.difficulty);
  const equipment = useSelector((state: RootState) => state.filters.equipment);

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
    toast.warning("Has cerrado sesión");
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      dispatch(clearFilters());
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [dispatch, search]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery<SearchExercisesResponse>({
    queryKey: ['exercises', debouncedSearch, muscleGroup, difficulty, equipment, page, pageSize],
    queryFn: () => {
      if (muscleGroup || difficulty || equipment) {
        return filterExercisesByProps(muscleGroup, difficulty, equipment, limit, page);
      }
      return searchExercisesByName(debouncedSearch, limit, page);
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <>
      <div className="container mx-auto overflow-hidden px-4">
        <div className="flex items-center justify-between py-5">
          <div className="flex gap-2 items-center">
            <FlexiaIcon className="size-8" />
            <h1 className="text-sm font-medium">Bienvenid@ a Flexia Experts</h1>
          </div>
          <Button size="icon" className="rounded-full" onClick={handleLogout}>
            <BiLogOut />
          </Button>
        </div>

        <div className="flex w-full justify-between mb-4">
          <div className="flex w-1/2 gap-2">
            <Input
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={()=>setOpenFilters(!openFilters)}>
              Filtros
            </Button>
            {(muscleGroup || difficulty || equipment) && (
              <Button variant="destructive" onClick={()=>dispatch(clearFilters())}>
                Limpiar Filtros
              </Button>
            )}
          </div>
          <Button
            className="hover:cursor-pointer"
            onClick={()=>{
              setSelectedExercise(undefined);
              setOpenFormDrawer(true);
            }}
          >
            Nuevo Ejercicio
          </Button>
        </div>

        <ExercisesTable
          exercises={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          setSelectedExercise={setSelectedExercise}
          setOpenFormDrawer={setOpenFormDrawer}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          totalExercises={data?.total || 0}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>
      <ExercisesTableFiltersDrawer
        open={openFilters}
        setOpen={setOpenFilters}
      />
      <CreateEditExerciseDrawer
        open={openFormDrawer}
        setOpen={setOpenFormDrawer}
        selectedExercise={selectedExercise}
      />
    </>
  )
}