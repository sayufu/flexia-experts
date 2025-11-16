import {type ColumnDef } from "@tanstack/react-table";
import {DataTable} from "@/components/ui/data-table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {FiEdit} from "react-icons/fi";
import { toast } from "sonner"
import type {Exercise} from "@/exercises/types/exercise.ts";
import type {MuscleGroup} from "@/exercises/types/muscle-group.ts";
import {DIFFICULTIES, EQUIPMENTS, MUSCLES} from "@/exercises/utils/filters.ts";
import type {Equipment} from "@/exercises/types/equipment.ts";
import {mapLabel} from "@/exercises/utils/mapLabel.ts";

interface ExercisesTableProps {
  setSelectedExercise: (exercise: Exercise) => void;
  setOpenFormDrawer: (open: boolean) => void;
  exercises: Exercise[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalExercises: number;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export const ExercisesTable = (
  {
    setSelectedExercise,
    setOpenFormDrawer,
    exercises,
    isLoading,
    isError,
    page,
    setPage,
    totalPages,
    totalExercises,
    pageSize,
    setPageSize,
  }: ExercisesTableProps
) => {
  const getMuscleLabel = mapLabel(MUSCLES);
  const getDifficultyLabel = mapLabel(DIFFICULTIES);
  const getEquipmentLabel = mapLabel(EQUIPMENTS);

  const difficultyStars: Record<string, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  const columns: ColumnDef<Exercise>[] = [
    { accessorKey: "name", header: "Nombre" },
    {
      accessorKey: "muscleGroups",
      header: "Músculo principal",
      cell: ({ row }) => {
        const muscleGroups: MuscleGroup[] = row.getValue("muscleGroups");
        return getMuscleLabel(muscleGroups[0]);
      },
    },
    {
      accessorKey: "equipments",
      header: "Equipamiento principal",
      cell: ({ row }) => {
        const equipments: Equipment[] = row.getValue("equipments");
        return getEquipmentLabel(equipments[0]);
      },
    },
    {
      accessorKey: "difficulty",
      header: "Dificultad",
      cell: ({ row }) => {
        const value = row.getValue("difficulty");
        const label = getDifficultyLabel(String(value));
        const starsCount = difficultyStars[String(value)] || 0;
        const stars = "⭐".repeat(starsCount);
        return `${stars} ${label}`;
      },
    },
    {
      accessorKey: "active",
      header: "Visualización",
      cell: ({ row }) => {
        const active = row.getValue("active");
        return active ? "🟢 Activo" : "🔴 Inactivo";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha de creación",
      cell: ({ row }) => {
        const value = row.getValue("createdAt");
        if (!value) return "";
        const date = new Date(String(value));
        return date.toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <Button
            onClick={() => {
              if (row.original.id) {
                setSelectedExercise(row.original);
                setOpenFormDrawer(true);
              } else {
                toast.error("Error recuperando el ejercicio");
              }
            }}
          >
            <FiEdit />
          </Button>
        );
      },
    }
  ];

  return (
    <div className="flex flex-col gap-2 justify-between h-[80vh]">
      {isLoading ? (
        <div className="w-full h-full">
          <div className="flex flex-col space-y-4 animate-pulse">
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={`header-${i}`} className="h-8 bg-gray-200 rounded" />
              ))}
            </div>
            {[...Array(7)].map((_, rowIdx) => (
              <div
                key={`row-${rowIdx}`}
                className="grid grid-cols-7 gap-4"
              >
                {[...Array(7)].map((_, colIdx) => (
                  <div key={colIdx} className="h-8 bg-gray-100 rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center w-full h-full">
          Ocurrió un error cargando los datos.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={exercises}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          totalExercises={totalExercises}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      )}
    </div>
  )
}