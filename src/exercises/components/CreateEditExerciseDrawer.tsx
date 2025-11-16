import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent, DrawerDescription, DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {IoMdClose} from "react-icons/io";
import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {createExercise, deleteExercise, updateExercise} from "@/api/exercises/exercisesApi.ts";
import type {CreateExercise, Exercise} from "@/exercises/types/exercise.ts";
import {useEffect, useRef, useState} from "react";
import {
  buildExerciseObject,
  buildUpdateObject,
  type ExerciseFormData,
  resetFormValues
} from "@/exercises/utils/exerciseFormUtils.ts";
import {ExerciseForm} from "@/exercises/components/ExerciseForm.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const CreateEditExerciseDrawer = (
  {
    open,
    setOpen,
    selectedExercise
  }: {
    open: boolean,
    setOpen: (open: boolean) => void,
    selectedExercise?: Exercise,
  }
) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const originalValuesRef = useRef<Exercise | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    setValue,
    control,
    getValues,
    reset
  } = useForm<ExerciseFormData>({
    defaultValues: {
      id: "",
      title: "",
      description: "",
      difficulty: "Beginner",
      muscles: [],
      equipments: [],
      active: "true",
    },
  });

  useEffect(() => {
    resetFormValues(selectedExercise, reset, setPreviewImage, originalValuesRef);
  }, [selectedExercise, reset, open]);

  useEffect(() => {
    if (selectedExercise?.mediaUrl) {
      setPreviewImage(selectedExercise.mediaUrl);
    } else {
      setPreviewImage(null);
    }
  }, [selectedExercise]);

  const { mutate, isPending } = useMutation({
    mutationFn: (newExercise: CreateExercise) => createExercise(newExercise),
    onSuccess: () => {
      toast.success("Ejercicio creado con éxito");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: () => {
      toast.error("Error al crear el ejercicio");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: Partial<CreateExercise> }) =>
      updateExercise(id, formData),
    onSuccess: () => {
      toast.success("Ejercicio actualizado con éxito.");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: () => {
      toast.error("Error al actualizar el ejercicio.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      toast.warning("Ejercicio eliminado con éxito.");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: () => {
      toast.error("Error al eliminar el ejercicio.");
    },
  });

  function handleCreateExercise() {
    const values = getValues();
    const formData = buildExerciseObject(values);
    mutate(formData);
  }

  function handleEditExercise() {
    const values = getValues();
    const original = originalValuesRef.current;
    if (!original) return;

    const updated = buildUpdateObject(values, original);

    if (Object.keys(updated).length > 0) {
      updateMutation.mutate({ id: original.id, formData: updated });
    } else {
      toast.info("No hay cambios para guardar.");
    }
  }
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction="right"
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="flex w-full justify-between items-center">
            <DrawerTitle className="text-[#64748B] font-bold">
              {selectedExercise ? "Editando ejercicio" : "Crear nuevo ejercicio"}
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
            <button className="hover:cursor-pointer" onClick={()=>setOpen(false)}>
              <IoMdClose size={20} />
            </button>
          </div>
        </DrawerHeader>

        <ExerciseForm
          selectedExerciseId={selectedExercise?.id}
          register={register}
          control={control}
          setValue={setValue}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
        />

        <DrawerFooter>
          <Button
            className="mt-2"
            disabled={isPending || updateMutation.isPending}
            onClick={selectedExercise ? handleEditExercise : handleCreateExercise}
          >
            {(isPending || updateMutation.isPending)
              ? "Guardando..."
              : selectedExercise ? "Guardar cambios" : "Crear ejercicio"}
          </Button>
          {selectedExercise && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar ejercicio"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Seguro que quieres eliminar este ejercicio?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El ejercicio será eliminado de forma permanente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      if (selectedExercise?.id) {
                        deleteMutation.mutate(selectedExercise.id)
                      }
                    }}
                  >
                    Sí, eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}