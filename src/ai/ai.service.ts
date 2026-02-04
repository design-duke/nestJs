import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  async streamChat(prompt: string, model = 'qwen-turbo'): Promise<Readable> {
    const apiKey = this.configService.get<string>('DASHSCOPE_API_KEY');
    if (!apiKey) throw new Error('DASHSCOPE_API_KEY 未配置');

    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages: [{ role: 'user', content: prompt }],
        }),
      },
    );

    if (!response.ok || !response.body) {
      throw new Error(`DashScope 请求失败: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let ended = false;

    return new Readable({
      async read() {
        if (ended) return;

        try {
          const { done, value } = await reader.read();

          if (done) {
            ended = true;
            this.push(null);
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            const line = event.trim();
            if (!line.startsWith('data:')) continue;

            const data = line.replace(/^data:\s*/, '').trim();

            if (data === '[DONE]') {
              ended = true;
              await reader.cancel();
              this.push(null);
              return;
            }

            let json: any;
            try {
              json = JSON.parse(data);
            } catch {
              continue;
            }

            const finishReason = json.choices?.[0]?.finish_reason;
            if (finishReason === 'stop') {
              ended = true;
              await reader.cancel();
              this.push(null);
              return;
            }

            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              this.push(content);
            }
          }
        } catch (err) {
          ended = true;
          this.destroy(err as Error);
        }
      },
    });
  }
}
