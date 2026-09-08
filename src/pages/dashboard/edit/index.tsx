import { useContext, useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { v4 as uuidV4 } from "uuid";
import { FiTrash, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import { AuthContext } from "../../../contexts/AuthContext";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelheader";
import { Input } from "../../../components/input";
import { db, storage } from "../../../services/firebaseConnection";

const schema = z.object({
  name: z.string().nonempty("O campo nome é obrigatório"),
  model: z.string().nonempty("O campo modelo é obrigatório"),
  year: z.string().nonempty("O ano do carro é obrigatório"),
  km: z.string().nonempty("O KM é obrigatório"),
  price: z.string().nonempty("O preço é obrigatório"),
  city: z.string().nonempty("A cidade é obrigatória"),
  whatsapp: z
    .string()
    .min(1, "O telefone é obrigatório")
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: "Número de telefone invalido",
    }),
  description: z.string().nonempty("A descrição é obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface CarImage {
  name: string;
  uid: string;
  url: string;
  previewUrl: string;
}

interface CarData extends FormData {
  uid: string;
  images: CarImage[];
}

export function Edit() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [carImages, setCarImages] = useState<CarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    async function loadCar() {
      if (!id || !user?.uid) {
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "cars", id));
        const data = snapshot.data() as CarData | undefined;

        if (!snapshot.exists() || !data || data.uid !== user.uid) {
          toast.error("Veículo não encontrado");
          navigate("/dashboard", { replace: true });
          return;
        }

        reset({
          name: data.name,
          model: data.model,
          year: data.year,
          km: data.km,
          price: data.price,
          city: data.city,
          whatsapp: data.whatsapp,
          description: data.description,
        });
        setCarImages(
          data.images.map((image) => ({
            ...image,
            previewUrl: image.url,
          })),
        );
      } catch {
        toast.error("Erro ao carregar o veículo");
        navigate("/dashboard", { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadCar();
  }, [id, navigate, reset, user?.uid]);

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }

    const imageName = uuidV4();
    const uploadRef = ref(storage, `images/${user.uid}/${imageName}`);
    const snapshot = await uploadBytes(uploadRef, image);
    const url = await getDownloadURL(snapshot.ref);

    setCarImages((images) => [
      ...images,
      {
        name: imageName,
        uid: user.uid,
        previewUrl: URL.createObjectURL(image),
        url,
      },
    ]);
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];

    if (!image) {
      return;
    }

    if (image.type !== "image/jpeg" && image.type !== "image/png") {
      toast.error("Somente imagens no formato JPEG ou PNG");
      return;
    }

    try {
      await handleUpload(image);
    } catch {
      toast.error("Erro ao enviar a imagem");
    }
    event.target.value = "";
  }

  async function handleDeleteImage(image: CarImage) {
    try {
      await deleteObject(ref(storage, `images/${image.uid}/${image.name}`));
      setCarImages((images) => images.filter((item) => item.url !== image.url));
    } catch {
      toast.error("Erro ao excluir a imagem");
    }
  }

  async function onSubmit(data: FormData) {
    if (!id || carImages.length === 0) {
      toast.error("O veículo precisa ter pelo menos uma imagem");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "cars", id), {
        ...data,
        name: data.name.toUpperCase(),
        images: carImages.map(({ name, uid, url }) => ({ name, uid, url })),
      });
      toast.success("Veículo atualizado com sucesso");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Erro ao atualizar o veículo");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <label className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <FiUpload size={30} color="#000" />
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFile}
          />
        </label>

        {carImages.map((image) => (
          <div
            key={image.name}
            className="w-full h-32 flex items-center justify-center relative"
          >
            <button
              type="button"
              aria-label="Excluir imagem"
              title="Excluir imagem"
              className="absolute z-10"
              onClick={() => handleDeleteImage(image)}
            >
              <FiTrash size={28} color="#fff" />
            </button>
            <img
              src={image.previewUrl}
              alt="Foto do carro"
              className="rounded-lg w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input
              name="name"
              type="text"
              register={register}
              error={errors.name?.message}
              placeholder="Gol g6 1.0"
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              name="model"
              type="text"
              register={register}
              error={errors.model?.message}
              placeholder="1.0 flex"
            />
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano do carro</p>
              <Input
                name="year"
                type="text"
                register={register}
                error={errors.year?.message}
                placeholder="2013/2014"
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Km rodados</p>
              <Input
                name="km"
                type="text"
                register={register}
                error={errors.km?.message}
                placeholder="23.000"
              />
            </div>
          </div>
          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp</p>
              <Input
                name="whatsapp"
                type="text"
                register={register}
                error={errors.whatsapp?.message}
                placeholder="01194615247"
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                name="city"
                type="text"
                register={register}
                error={errors.city?.message}
                placeholder="Guarulhos/SP"
              />
            </div>
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              name="price"
              type="text"
              register={register}
              error={errors.price?.message}
              placeholder="36.000"
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              placeholder="Digite a descrição do veículo"
            />
            {errors.description && (
              <p className="mb-1 text-red-500">{errors.description.message}</p>
            )}
          </div>
          <button
            className="bg-zinc-900 rounded-lg text-white font-medium w-full p-2"
            type="submit"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </Container>
  );
}
