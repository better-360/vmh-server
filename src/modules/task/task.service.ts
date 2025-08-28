import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateTaskDto, TaskMessageDto } from "src/dtos/support.dto";
import { TaskStatus, TaskType, TaskPriority, TaskMessage, Task } from "@prisma/client";
import { Action } from "src/authorization/casl/action.enum";

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) { }

    async createTask(userId: string, data: CreateTaskDto) {
        const mailbox = await this.prisma.mailbox.findUnique({ where: { id: data.mailboxId } });
        if (!mailbox) throw new NotFoundException('Mailbox not found');
        const officeLocation = await this.prisma.officeLocation.findUnique({ where: { id: mailbox.officeLocationId } });
        if (!officeLocation) throw new NotFoundException('Office location not found');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const firstMessage = data.message?.message;
        const task = await this.prisma.task.create({
            data: {
                officeLocationId: officeLocation.id,
                mailboxId: mailbox.id,
                creatorId: userId,
                title: data.title,
                description: data.description,
                Icon: data.Icon,
                priority: data.priority,
                status: TaskStatus.OPEN,
                type: TaskType.MANUAL,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                messages: firstMessage
                    ? {
                        create: [{
                            message: firstMessage,
                            fromStaff: true,
                             user:{connect:{id:userId}},
                            attachments: data.message?.attachments?.length
                                ? {
                                    create: data.message.attachments.map(a => ({
                                        name: a.name,
                                        url: a.url,
                                        type: a.type,
                                        uploadedById: userId,
                                    }))
                                }
                                : undefined,
                        }],
                    }
                    : undefined,
            },
            include: { messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true } } },
        });
        return {
            ...task,
            messages: await this.formatMessages(task.messages),
        };
    }

    async createTaskByUser(userId: string, data: CreateTaskDto) {
        const mailbox = await this.prisma.mailbox.findUnique({ where: { id: data.mailboxId } });
        if (!mailbox) throw new NotFoundException('Mailbox not found');
        const officeLocation = await this.prisma.officeLocation.findUnique({ where: { id: mailbox.officeLocationId } });
        if (!officeLocation) throw new NotFoundException('Office location not found');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const firstMessage = data.message?.message;
        const task = await this.prisma.task.create({
            data: {
                officeLocationId: officeLocation.id,
                mailboxId: mailbox.id,
                creatorId: userId,
                title: data.title,
                description: data.description,
                Icon: data.Icon,
                priority: data.priority,
                status: TaskStatus.OPEN,
                type: TaskType.MANUAL,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                messages: firstMessage
                    ? {
                        create: [{
                            message: firstMessage,
                            fromStaff: false,
                            user:{connect:{id:userId}},
                            attachments: data.message?.attachments?.length
                                ? {
                                    create: data.message.attachments.map(a => ({
                                        name: a.name,
                                        url: a.url,
                                        type: a.type,
                                        uploadedById: userId,
                                    }))
                                }
                                : undefined,
                        }],
                    }
                    : undefined,
            },
            include: { messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true } } },
        });
        return {
            ...task,
            messages: await this.formatMessages(task.messages),
        };
    }

    async createAutomaticTask(
        mailboxId: string,
        params?: {
            title?: string;
            description?: string;
            priority?: TaskPriority;
            dueDate?: string;
            message?: string;
        }
    ) {
        const mailbox = await this.prisma.mailbox.findUnique({ where: { id: mailboxId } });
        if (!mailbox) throw new NotFoundException('Mailbox not found');
        const officeLocation = await this.prisma.officeLocation.findUnique({ where: { id: mailbox.officeLocationId } });
        if (!officeLocation) throw new NotFoundException('Office location not found');

        const autoMessage = params?.message ?? 'System generated task. We will take a look.';
        const task = await this.prisma.task.create({
            data: {
                officeLocationId: officeLocation.id,
                mailboxId: mailbox.id,
                creatorId: null,
                title: params?.title ?? 'Automatic Task',
                description: params?.description,
                Icon: 'system',
                priority: params?.priority ?? TaskPriority.MEDIUM,
                status: TaskStatus.OPEN,
                type: TaskType.AUTOMATIC,
                dueDate: params?.dueDate ? new Date(params.dueDate) : undefined,
                messages: {
                    create: [{ message: autoMessage, fromStaff: true }],
                },
            },
            include: { messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true } } },
        });
        return {
            ...task,
            messages: await this.formatMessages(task.messages),
        };
    }

    async updateTask(id: string, data: any) {
        const existing = await this.prisma.task.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Task not found');
        const updated = await this.prisma.task.update({ where: { id }, data});
        return this.getTaskById(updated.id);
    }

    async deleteTask(id: string): Promise<{ success: true }> {
        const existing = await this.prisma.task.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Task not found');
        await this.prisma.task.delete({ where: { id } });
        return { success: true };
    }

    async getTaskById(id: string, ability?: any) {
        const task = await this.prisma.task.findUnique({
            where: { id }, include: {
                messages: {
                    orderBy: { createdAt: 'asc' }, include: {
                user:{select:{
                    id:true,
                    firstName:true,
                    lastName:true,
                    telephone:true,
                    email:true,
                    profileImage:true,
                }} ,
                        attachments: true,
                    }
                }, 
                mailbox: true, 
                creator: {select:{
                    id:true,
                    firstName:true,
                    lastName:true,
                    email:true,
                    telephone:true,
                }}
            }
        });
        if (!task) throw new NotFoundException('Task not found');
        if(ability){
            const canRead = await ability.can(Action.READ, task);
            if(!canRead) throw new ForbiddenException('You are not allowed to read this task');
        }
        return {
            ...task,
            messages: await this.formatMessages(task.messages),
        };
    }

    async listTasksByOfficeLocation(officeLocationId: string) {
        // officeLocation is via mailbox.officeLocationId
        return this.prisma.task.findMany({
            where: { mailbox: { officeLocationId } },
            include: {
                mailbox: {
                    select: {
                        id: true,
                        steNumber: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        telephone: true,
                        profileImage: true,
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async listTasksByMailbox(mailboxId: string) {
        return this.prisma.task.findMany({ where: { mailboxId }, orderBy: { createdAt: 'desc' } });
    }

    async addMessage(taskId: string, userId: string, data: TaskMessageDto) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new NotFoundException('Task not found');
        const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { roles: true } });
        const isStaff = user?.roles.some(r => ['ADMIN', 'STAFF', 'SUPERADMIN'].includes(r.role as any)) ?? false;
        console.log('isStaff', isStaff);
        console.log('data', user.roles);
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                messages: {
                    create: {
                        message: data.message,
                        fromStaff: isStaff,
                        user:{connect:{id:userId}},
                        attachments: data.attachments?.length
                            ? {
                                create: data.attachments.map(a => ({
                                    name: a.name,
                                    url: a.url,
                                    type: a.type,
                                    uploadedById: userId,
                                }))
                            }
                            : undefined,
                    }
                }
            },
            include: { messages: { orderBy: { createdAt: 'asc' }, include: { attachments: true, user: {select:{
                id:true,
                firstName:true,
                lastName:true,
            }} } } },
        });
        return {
            ...updatedTask,
            messages: await this.formatMessages(updatedTask.messages),
        };
    }


async getTasks(mailboxId: string) {
    const tasks = await this.prisma.task.findMany({
        where: { mailboxId },
        orderBy: { createdAt: 'desc' },
    });
    return tasks;
}

    private async formatMessages(messages: any[]) {
        return messages.map(message => {
            return {
                message: message.message,
                fromStaff: message.fromStaff,
                createdAt: message.createdAt,
                user: message.user,
                attachments: message.attachments?.map(a => ({
                    name: a.name,
                    url: a.url,
                    type: a.type,
                })),
            }
        });
    }
}