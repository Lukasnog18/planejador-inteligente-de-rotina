import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FixedCommitment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
}

interface RoutineInput {
  dayStartTime: string;
  dayEndTime: string;
  fixedCommitments: FixedCommitment[];
  objectives: string[];
  restrictions: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input } = await req.json() as { input: RoutineInput };
    
    if (!input) {
      return new Response(
        JSON.stringify({ error: "Dados de entrada não fornecidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não está configurada");
    }

    const systemPrompt = `Você é um assistente especializado em planejamento de rotinas diárias. 
Sua tarefa é criar uma rotina otimizada baseada nas informações do usuário.

REGRAS IMPORTANTES:
1. Todas as atividades devem estar dentro do horário especificado pelo usuário
2. Compromissos fixos NUNCA podem ser alterados ou removidos
3. Inclua pausas regulares (10-15 min a cada 2-3 horas de trabalho/estudo)
4. Respeite TODAS as restrições informadas
5. Distribua os objetivos de forma equilibrada ao longo do dia
6. Inclua horários para refeições se não informados (café da manhã, almoço, jantar)
7. Deixe tempo para transições entre atividades

CATEGORIAS DISPONÍVEIS:
- work: Trabalho
- study: Estudo  
- exercise: Exercício físico
- leisure: Lazer e entretenimento
- personal: Atividades pessoais
- meal: Refeições
- sleep: Descanso
- other: Outras atividades

Responda APENAS com um JSON válido no seguinte formato:
{
  "activities": [
    {
      "id": "string único",
      "title": "nome da atividade",
      "description": "descrição breve (opcional)",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "category": "uma das categorias acima",
      "isFixed": boolean (true apenas para compromissos fixos do usuário),
      "order": número sequencial
    }
  ]
}`;

    const userPrompt = `Crie uma rotina diária otimizada com base nas seguintes informações:

HORÁRIO DO DIA:
- Início: ${input.dayStartTime}
- Fim: ${input.dayEndTime}

COMPROMISSOS FIXOS (não podem ser alterados):
${input.fixedCommitments.length > 0 
  ? input.fixedCommitments.map(c => `- ${c.title}: ${c.startTime} às ${c.endTime} (categoria: ${c.category})`).join('\n')
  : 'Nenhum compromisso fixo informado'}

OBJETIVOS DO USUÁRIO:
${input.objectives.length > 0 
  ? input.objectives.map(o => `- ${o}`).join('\n')
  : 'Nenhum objetivo específico informado'}

RESTRIÇÕES:
${input.restrictions.length > 0 
  ? input.restrictions.map(r => `- ${r}`).join('\n')
  : 'Nenhuma restrição informada'}

Gere uma rotina completa, equilibrada e que maximize a produtividade do usuário.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao processar a geração de rotina");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia do serviço de IA");
    }

    // Extract JSON from the response
    let activities;
    try {
      // Try to parse the content directly
      const parsed = JSON.parse(content);
      activities = parsed.activities;
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1].trim());
        activities = parsed.activities;
      } else {
        throw new Error("Não foi possível processar a resposta da IA");
      }
    }

    if (!Array.isArray(activities)) {
      throw new Error("Formato de resposta inválido");
    }

    return new Response(
      JSON.stringify({ activities }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-routine:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
