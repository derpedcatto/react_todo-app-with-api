import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';
import { USER_ID } from '../utils/preferences';

type AddTodoParams = Omit<Todo, 'id'>;
type UpdateTodoParams = Pick<Todo, 'id'> & Partial<Todo>;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const addTodo = (data: AddTodoParams) => {
  return client.post<Todo>(`/todos`, data);
};

export const deleteTodo = (todoId: number) => {
  return client.delete(`/todos/${todoId}`);
};

export const updateTodo = ({
  id,
  ...data
}: UpdateTodoParams): Promise<Todo> => {
  return client.patch(`/todos/${id}`, data);
};
