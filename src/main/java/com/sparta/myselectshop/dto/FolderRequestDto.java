package com.sparta.myselectshop.dto;

import com.sparta.myselectshop.repository.FolderRepository;
import lombok.Getter;

import java.util.List;

@Getter
public class FolderRequestDto {
    List<String> folderNames;
}
