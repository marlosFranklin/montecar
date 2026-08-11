import { useState, type ChangeEvent } from "react";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { FiTrash, FiUpload } from "react-icons/fi";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelheader";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidV4 } from "uuid";
import { storage } from "../../../services/firebaseConnection";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

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

interface PropsCarImagem {
  name: string;
  uid: string;
  previewUrl: string;
  url: string;
}
export function New() {
  const { user } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const [carImagem, setCarImagem] = useState<PropsCarImagem[]>([]);

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }
    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imagemItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        };
        setCarImagem((images) => [...images, imagemItem]);
      });
    });
  }
  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === "image/jpeg" || image.type === "image/png") {
        await handleUpload(image);
      } else {
        alert("somente imagens no formato JPEG ou PNG");
      }
    }
  }

  async function handleDeleteImage(item: PropsCarImagem) {
    const imagePath = `images/${item.uid}/${item.name}`;

    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef);
      setCarImagem(carImagem.filter((car) => car.url !== item.url));
    } catch (error) {
      console.log("erro ao deletar");
    }
  }
  return (
    <Container>
      <DashboardHeader />

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className=" border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className=" absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>

          <div className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
        </button>

        {carImagem.map((item) => (
          <div
            key={item.name}
            className=" w-full h-32 flex items-center justify-center relative"
          >
            <button
              className="absolute"
              onClick={() => handleDeleteImage(item)}
            >
              <FiTrash size={28} color="#fff" />
            </button>
            <img
              src={item.previewUrl}
              alt="foto do carro"
              className=" rounded-lg w-full h-32 object-cover"
            />
          </div>
        ))}
      </div>

      <div className=" w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro </p>
            <Input
              name="name"
              type="text"
              register={register}
              error={errors.name?.message}
              placeholder="Gol g6 1.0"
            />
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro </p>
            <Input
              name="model"
              type="text"
              register={register}
              error={errors.model?.message}
              placeholder="1.0 flex "
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano do carro </p>
              <Input
                name="year"
                type="text"
                register={register}
                error={errors.year?.message}
                placeholder="2013/2014 "
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium">Km rodados </p>
              <Input
                name="km"
                type="text"
                register={register}
                error={errors.km?.message}
                placeholder="23.00 "
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp </p>
              <Input
                name="whatsapp"
                type="text"
                register={register}
                error={errors.whatsapp?.message}
                placeholder="01194615247"
              />
            </div>
            <div className="w-full">
              <p className="mb-2 font-medium"> Cidade </p>
              <Input
                name="city"
                type="text"
                register={register}
                error={errors.city?.message}
                placeholder=" Guarulhos/SP"
              />
            </div>
          </div>
          <div className="mb-3">
            <p className="mb-2 font-medium">Preço </p>
            <Input
              name="price"
              type="text"
              register={register}
              error={errors.price?.message}
              placeholder="36.000"
            />
          </div>

          <div className=" mb-3">
            <p className=" mb-2 font-medium">Descrição</p>
            <textarea
              className=" border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder=" digite a descrição do veiculo "
            />
            {errors.description && (
              <p className="mb-1 text-red-500">{errors.description.message}</p>
            )}
          </div>

          <button
            className="bg-zinc-900 rounded-lg text-white font-medium w-full p-2"
            type="submit"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </Container>
  );
}
