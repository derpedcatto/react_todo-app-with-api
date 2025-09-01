import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 3423;

type AddTodoParams = Omit<Todo, 'id'>;
type UpdateTodoParams = Pick<Todo, 'id'> & Partial<Omit<Todo, 'id' | 'userId'>>;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const addTodo = (todo: AddTodoParams) => {
  return client.post<Todo>(`/todos`, todo);
};

export const deleteTodo = (todoId: number) => {
  return client.delete(`/todos/${todoId}`);
};

export const updateTodo = (todo: UpdateTodoParams): Promise<Todo> => {
  return client.patch(`/todos/${todo.id}`, {
    completed: todo.completed,
    title: todo.title,
  });
};
