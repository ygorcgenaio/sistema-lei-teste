'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cadastrarItemAction } from '@/app/actions/inventario';

type Categoria = {id:number;nome:string};
type Tipo = {id:number;categoria_id:number;nome:string};
const input = 'w-full border border-gray-300 rounded-md p-2 text-sm text-gray-900 bg-white';
export default function CadastroItem() {
 const router=useRouter();
 const [categorias,setCategorias]=useState<Categoria[]>([]);
 const [tipos,setTipos]=useState<Tipo[]>([]);
 const [categoria,setCategoria]=useState('');
 const [tipo,setTipo]=useState('');
 const [carregando,setCarregando]=useState(true);
 const [salvando,setSalvando]=useState(false);
 const [erro,setErro]=useState('');
 useEffect(()=>{fetch('/api/itens/opcoes',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('Falha ao carregar categorias');return r.json()}).then(d=>{setCategorias(d.categorias);setTipos(d.tipos)}).catch(()=>setErro('Erro ao carregar categorias e tipos.')).finally(()=>setCarregando(false));},[]);
 const tipoNome=tipos.find(t=>String(t.id)===tipo)?.nome;
 async function enviar(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setErro('');setSalvando(true);try{const resposta=await cadastrarItemAction(new FormData(e.currentTarget));if(resposta.erro){setErro(resposta.erro);return;}router.push('/itens');router.refresh();}catch{setErro('Falha ao comunicar com o servidor.')}finally{setSalvando(false)}}
 return <main className="min-h-screen bg-gray-100 p-5 md:p-8"><div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow text-gray-900">
 <div className="flex justify-between mb-6 gap-3"><div><h1 className="text-2xl font-bold text-blue-900">Cadastrar item patrimonial</h1><p className="text-sm text-gray-500">Inventário · SiGPatri</p></div><a className="text-blue-700 underline" href="/itens">Voltar</a></div>
 {erro&&<div role="alert" className="p-3 mb-4 bg-red-50 text-red-800 rounded">{erro}</div>}
 <form onSubmit={enviar} className="space-y-5"><div className="grid md:grid-cols-2 gap-4">
 <label className="text-sm font-medium">Código interno LEI *<input className={input} name="codigo_lei" required maxLength={50} placeholder="NOTE LEI 001" /></label>
 <label className="text-sm font-medium">Patrimônio institucional (opcional)<input className={input} name="patrimonio" maxLength={50} placeholder="Número de patrimônio" /></label>
 <label className="text-sm font-medium">Categoria *<select className={input} name="categoria_id" value={categoria} required disabled={carregando} onChange={e=>{setCategoria(e.target.value);setTipo('')}}><option value="">Selecione...</option>{categorias.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
 <label className="text-sm font-medium">Tipo *<select className={input} name="tipo_item_id" value={tipo} required onChange={e=>setTipo(e.target.value)} disabled={!categoria}><option value="">Selecione...</option>{tipos.filter(t=>String(t.categoria_id)===categoria).map(t=><option value={t.id} key={t.id}>{t.nome}</option>)}</select></label>
 </div><label className="block text-sm font-medium">Descrição *<textarea className={input} name="descricao" required rows={2} maxLength={255} placeholder="Ex.: Mesa retangular de escritório" /></label>
 <div className="grid md:grid-cols-3 gap-4">{[['Marca','marca'],['Modelo','modelo'],['Número de série','numero_serie']].map(([l,n])=><label className="text-sm font-medium" key={n}>{l}<input className={input} name={n}/></label>)}</div>
 {['Notebook','Computador Desktop'].includes(tipoNome||'')&&<section className="p-4 bg-blue-50 rounded-lg"><h2 className="font-semibold mb-3">Dados técnicos</h2><div className="grid md:grid-cols-2 gap-4">{[['Processador','processador'],['Memória RAM','memoria_ram'],['Armazenamento','armazenamento'],['Sistema operacional','sistema_operacional']].map(([l,n])=><label className="text-sm" key={n}>{l}<input className={input} name={n}/></label>)}</div></section>}
 <div className="grid md:grid-cols-3 gap-4"><label className="text-sm">Status<select name="status" className={input} defaultValue="DISPONIVEL">{['DISPONIVEL','RESERVADO','EMPRESTADO','EM_MANUTENCAO','INSERVIVEL','BAIXADO'].map(s=><option key={s}>{s}</option>)}</select></label><label className="text-sm">Conservação<select name="estado_conservacao" className={input} defaultValue="BOM">{['NOVO','BOM','REGULAR','RUIM'].map(s=><option key={s}>{s}</option>)}</select></label><label className="text-sm">Localização atual<input name="localizacao_atual" className={input} defaultValue="LEI"/></label></div>
 <div className="grid md:grid-cols-2 gap-4"><label className="text-sm">Data da compra<input type="date" name="data_compra" className={input}/></label><label className="text-sm">Data do recebimento<input type="date" name="data_recebimento_lei" className={input}/></label><label className="text-sm">Origem<select name="origem_aquisicao" className={input} defaultValue="RECURSOS_LEI"><option value="">Não informada</option>{[['RECURSOS_UFF','Recursos UFF'],['RECURSOS_LEI','Recursos LEI'],['PROJETO','Projeto'],['DOACAO','Doação'],['CESSAO','Cessão'],['OUTRO','Outro']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="text-sm">Projeto de origem<input name="projeto_origem" className={input}/></label><label className="text-sm">Número da nota fiscal<input name="numero_nota_fiscal" className={input}/></label><label className="text-sm">Nota fiscal (PDF, até 5 MB)<input type="file" accept="application/pdf,.pdf" name="pdf_file" className={input}/></label></div>
 <label className="block text-sm">Observações<textarea className={input} name="observacoes" rows={2}/></label><button type="submit" disabled={salvando||carregando} className="w-full bg-blue-700 text-white rounded-md py-3 font-semibold disabled:opacity-40">{salvando?'Salvando...':'Cadastrar item'}</button>
 </form></div></main>
}
