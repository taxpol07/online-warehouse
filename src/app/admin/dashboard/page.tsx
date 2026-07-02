"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/auth";

// 1. ADIM: TypeScript Interface (Yeni özellikler eklendi)
interface Equipment {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  dimensions: string;
  power_requirements: string;
  status: "available" | "sold";
  image_urls: string[]; // Supabase'den string de gelebiliyor, fonksiyonla çözeceğiz
}

// RESİM DÜZELTİCİ FONKSİYON: Thumbnaillerin görünmesini sağlar
const parseImageUrls = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

export default function DashboardPage() {
  const [items, setItems] = useState<Equipment[]>([]);

  // ADD FORM STATES
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [powerRequirements, setPowerRequirements] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  // EDIT STATES
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCondition, setEditCondition] = useState("");
  const [editDimensions, setEditDimensions] = useState("");
  const [editPowerRequirements, setEditPowerRequirements] = useState("");

  const fetchData = async () => {
    const { data } = await supabase
      .from("equipment")
      .select("*")
      .order("created_at", { ascending: false });

    setItems(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadImages = async () => {
    if (!images || images.length === 0) return [];
    const urls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      // Dosya adındaki boşlukları ve Türkçe karakterleri temizliyoruz
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "")}`;

      console.log(`${fileName} yükleniyor...`);

      const { error: uploadError } = await supabase.storage
        .from("equipment-images")
        .upload(fileName, file);

      if (uploadError) {
        alert(`Fotoğraf yüklenemedi: ${uploadError.message}`);
        console.error("Detaylı Supabase Hatası:", uploadError);
      } else {
        const { data } = supabase.storage
          .from("equipment-images")
          .getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const addEquipment = async () => {
    const imageUrls = await uploadImages();

    await supabase.from("equipment").insert([
      {
        title,
        brand,
        model,
        price: Number(price),
        description,
        category,
        condition,
        dimensions,
        power_requirements: powerRequirements,
        status: "available",
        image_urls: imageUrls,
      },
    ]);

    // Formu temizle
    setTitle("");
    setBrand("");
    setModel("");
    setPrice("");
    setDescription("");
    setCategory("");
    setCondition("");
    setDimensions("");
    setPowerRequirements("");
    setImages(null);

    fetchData();
  };

  const deleteEquipment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      await supabase.from("equipment").delete().eq("id", id);
      fetchData();
    }
  };

  const openEdit = (item: Equipment) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditBrand(item.brand);
    setEditModel(item.model);
    setEditPrice(item.price.toString());
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditCondition(item.condition || "");
    setEditDimensions(item.dimensions || "");
    setEditPowerRequirements(item.power_requirements || "");
  };

  const updateEquipment = async () => {
    if (!editingItem) return;

    await supabase
      .from("equipment")
      .update({
        title: editTitle,
        brand: editBrand,
        model: editModel,
        price: Number(editPrice),
        description: editDescription,
        category: editCategory,
        condition: editCondition,
        dimensions: editDimensions,
        power_requirements: editPowerRequirements,
      })
      .eq("id", editingItem.id);

    setEditingItem(null);
    fetchData();
  };

  const toggleStatus = async (item: Equipment) => {
    const newStatus = item.status === "available" ? "sold" : "available";

    await supabase
      .from("equipment")
      .update({ status: newStatus })
      .eq("id", item.id);

    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight flex items-center gap-3">
              Keser Machinery 
              <span className="text-white text-2xl">| Admin</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Manage your commercial catering equipment inventory securely.
            </p>
          </div>
          <div className="bg-[#1e293b] px-4 py-2 rounded-lg border border-slate-700 shadow-lg">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Developed By</span>
            <span className="text-sm font-bold text-blue-400">Polat Can Keser</span>
          </div>
        </div>

        {/* ADD FORM CARD */}
        <div className="bg-[#1e293b] shadow-xl rounded-2xl p-6 md:p-8 mb-10 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-lg">➕</span>
            Add New Equipment
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <input 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Product Title (e.g., Lincat Fryer)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Category (e.g., Ovens, Fryers)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <input 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <input 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            
            {/* YENİ EKLENEN TEKNİK DETAYLAR */}
            <input 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Condition (e.g., Refurbished, Like New)"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
            <input 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Dimensions (e.g., 600w x 600d x 900h mm)"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
            />
            <input 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Power Req. (e.g., 3-Phase 32A, Natural Gas)"
              value={powerRequirements}
              onChange={(e) => setPowerRequirements(e.target.value)}
            />
            <input 
              type="number"
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Price (£)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <textarea 
              className="bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 p-3.5 rounded-xl md:col-span-2 min-h-[120px] focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Detailed Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Upload Product Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all border border-slate-700 rounded-xl bg-[#0f172a]"
                onChange={(e) => setImages(e.target.files)}
              />
            </div>
          </div>

          <button
            onClick={addEquipment}
            className="mt-6 w-full md:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-500 hover:-translate-y-0.5 transition-all"
          >
            Save Equipment to Database
          </button>
        </div>

        {/* INVENTORY LIST */}
        <h2 className="text-xl font-bold text-white mb-4">Current Inventory</h2>
        <div className="grid gap-4">
          {items.map((item) => {
            // DÜZELTME: Resimleri güvenli şekilde okuyoruz
            const safeImages = parseImageUrls(item.image_urls);
            const displayImage = safeImages[0] || "/placeholder.png";

            return (
              <div
                key={item.id}
                className="bg-[#1e293b] border border-slate-700 shadow-md rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-500 transition-colors"
              >
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className="w-20 h-20 bg-[#0f172a] rounded-lg overflow-hidden flex-shrink-0 border border-slate-700">
                    <img
                      src={displayImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-100 text-lg">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {item.brand} • {item.model}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                        {item.category}
                      </span>
                      <span className="font-bold text-blue-400">
                        £{item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-700 pt-3 md:pt-0">
                  <button
                    onClick={() => toggleStatus(item)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                      item.status === "available"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </button>

                  <button
                    onClick={() => openEdit(item)}
                    className="px-4 py-2 text-xs font-bold bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteEquipment(item.id)}
                    className="px-4 py-2 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-12 bg-[#1e293b] border border-slate-700 rounded-xl">
              <p className="text-slate-400">No equipment found. Add your first item above.</p>
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-[#1e293b] border border-slate-700 p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl my-8">
              <h2 className="text-xl font-bold text-white mb-6">
                Edit Equipment
              </h2>

              <div className="space-y-3">
                <input 
                  className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Brand"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                  />
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Model"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                  />
                </div>
                
                <input 
                  className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Dimensions"
                  value={editDimensions}
                  onChange={(e) => setEditDimensions(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Condition"
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                  />
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Power Req."
                    value={editPowerRequirements}
                    onChange={(e) => setEditPowerRequirements(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number"
                    className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Price"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                  <input 
                    className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  />
                </div>
                <textarea 
                  className="w-full bg-[#0f172a] border border-slate-700 text-white p-3 rounded-lg min-h-[100px] focus:outline-none focus:border-blue-500"
                  placeholder="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={updateEquipment}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}