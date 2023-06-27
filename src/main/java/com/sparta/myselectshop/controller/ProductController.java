package com.sparta.myselectshop.controller;

import com.sparta.myselectshop.dto.ProductMyPriceRequestDto;
import com.sparta.myselectshop.dto.ProductRequestDto;
import com.sparta.myselectshop.dto.ProductResponseDto;
import com.sparta.myselectshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;
    @PostMapping("/products")
    public ProductResponseDto createProduct(@RequestBody ProductRequestDto requestDto){
        return  productService.createProduct(requestDto);
    }


    @PutMapping("/products/{id}")
    public ProductResponseDto updateProduct(@PathVariable Long id, @RequestBody ProductMyPriceRequestDto requestDto){
        return productService.updateProduct(id, requestDto);
    }

    @GetMapping("/products")
    public List <ProductResponseDto> geteProducts(){
        return productService.getProducts();
    }

    @GetMapping("/products/{id}")
    public ProductResponseDto geteProduct(@PathVariable Long id){
        return productService.getProduct(id);
    }
}
