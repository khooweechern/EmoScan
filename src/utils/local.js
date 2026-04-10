/**
 * 本地大模型 API 封装 (Dify 格式)
 * 文档：https://docs.dify.ai/
 */

// API 配置
const CONFIG = {
  // API Key
  apiKey: 'app-ppcmucMRRig8BoF1xhABicqK',
  // API 端点
  baseURL: 'http://192.168.48.4/v1',
  // 用户标识
  user: 'user-abc-123',
  // 会话ID（用于保持上下文）
  conversationId: ''
};

/**
 * 处理 SSE 事件
 */
function processSSEEvent(event, onChunk, onComplete, onError) {
  const lines = event.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || !trimmedLine.startsWith('data:')) {
      continue;
    }

    const data = trimmedLine.slice(5).trim();
    
    if (data === '[DONE]' || data === '[END]') {
      if (onComplete) onComplete();
      return;
    }

    try {
      const parsed = JSON.parse(data);
      
      // Dify 流式返回格式
      // event: message || agent_message || message_end
      // answer: 回复内容
      
      if (parsed.event === 'message' || parsed.event === 'agent_message') {
        if (parsed.answer && onChunk) {
          onChunk(parsed.answer);
        }
        // 更新会话ID
        if (parsed.conversation_id) {
          CONFIG.conversationId = parsed.conversation_id;
        }
      }
      else if (parsed.event === 'message_end') {
        if (onComplete) onComplete();
        return;
      }
      else if (parsed.event === 'error') {
        if (onError) onError(parsed.message || '未知错误');
        return;
      }
      // 兼容其他格式
      else if (parsed.answer) {
        if (onChunk) onChunk(parsed.answer);
      }
      else if (parsed.choices?.[0]?.delta?.content) {
        if (onChunk) onChunk(parsed.choices[0].delta.content);
      }
      
    } catch (e) {
      console.warn('本地模型 SSE 解析失败:', data);
    }
  }
}

/**
 * 流式调用本地大模型 API
 * @param {string} message - 用户消息
 * @param {Array} history - 历史对话记录（Dify 通过 conversation_id 管理）
 * @param {Function} onChunk - 收到数据块的回调
 * @param {Function} onComplete - 完成的回调
 * @param {Function} onError - 错误的回调
 */
export async function streamChat(message, history = [], onChunk, onComplete, onError) {
  try {
    const url = `${CONFIG.baseURL}/chat-messages`;
    
    const requestBody = {
      inputs: {},
      query: message,
      response_mode: 'streaming',
      conversation_id: CONFIG.conversationId,
      user: CONFIG.user,
      files: []
    };

    console.log('本地模型请求:', { url, query: message, conversationId: CONFIG.conversationId || '新会话' });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('本地模型响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('本地模型错误响应:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || errorData.error?.message || `HTTP ${response.status}`);
    }

    await processStreamResponse(response, processSSEEvent, onChunk, onComplete, onError);

  } catch (error) {
    console.error('本地模型 API 调用错误:', error);
    if (onError) onError(error.message || '网络请求失败');
  }
}

/**
 * 处理流式响应
 */
async function processStreamResponse(response, processor, onChunk, onComplete, onError) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      if (buffer.trim()) {
        processor(buffer, onChunk, onComplete, onError);
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const event of events) {
      processor(event, onChunk, onComplete, onError);
    }
  }

  if (onComplete) onComplete();
}

/**
 * 非流式调用
 */
export async function chat(message, history = []) {
  try {
    const url = `${CONFIG.baseURL}/chat-messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'blocking',
        conversation_id: CONFIG.conversationId,
        user: CONFIG.user,
        files: []
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // 更新会话ID
    if (data.conversation_id) {
      CONFIG.conversationId = data.conversation_id;
    }
    
    return data.answer || '';

  } catch (error) {
    console.error('本地模型 API 调用错误:', error);
    throw error;
  }
}

/**
 * 设置 API Key
 */
export function setApiKey(key) {
  CONFIG.apiKey = key;
}

/**
 * 设置 API 端点
 */
export function setBaseURL(url) {
  CONFIG.baseURL = url;
}

/**
 * 设置用户标识
 */
export function setUser(user) {
  CONFIG.user = user;
}

/**
 * 清除会话（开始新对话）
 */
export function clearConversation() {
  CONFIG.conversationId = '';
}

/**
 * 获取当前配置
 */
export function getConfig() {
  return { ...CONFIG };
}

export default {
  streamChat,
  chat,
  setApiKey,
  setBaseURL,
  setUser,
  clearConversation,
  getConfig
};
